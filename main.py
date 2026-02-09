
import asyncio
import base64
import io
import time
import torch
import torch.nn.functional as F
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from PIL import Image
import torchvision.transforms.functional as TF
from fastapi.middleware.cors import CORSMiddleware

import config
from model import Generator
from utils import load_checkpoint

app = FastAPI(title="SRGAN Super Resolution API")

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Load model at startup
# -------------------------
device = config.DEVICE

gen = Generator().to(device)
opt = torch.optim.Adam(gen.parameters(), lr=config.LEARNING_RATE)

load_checkpoint(config.CHECKPOINT_GEN, gen, opt, config.LEARNING_RATE)
gen.eval()

print("SRGAN model loaded.")


# -------------------------
# Helper functions
# -------------------------
# Max low-res side length so inference finishes in reasonable time (4x upscale)
MAX_LR_SIDE = 128


def preprocess(image: Image.Image):
    """Convert PIL image to normalized tensor. Downscale if too large."""
    w, h = image.size
    if max(w, h) > MAX_LR_SIDE:
        scale = MAX_LR_SIDE / max(w, h)
        new_w, new_h = int(w * scale), int(h * scale)
        image = image.resize((new_w, new_h), Image.BICUBIC)
    tensor = TF.to_tensor(image).unsqueeze(0).to(device)
    tensor = tensor * 2 - 1  # normalize to [-1, 1]
    return tensor


def postprocess(tensor):
    """Convert model output tensor to PIL."""
    tensor = tensor * 0.5 + 0.5  # denorm to [0,1]
    tensor = tensor.clamp(0, 1)
    img = TF.to_pil_image(tensor.squeeze(0).cpu())
    return img


# -------------------------
# API endpoints
# -------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/enhance")
async def enhance(
    image: UploadFile = File(..., description="Image file"),
    outscale: int = Query(4, ge=1, le=4, description="Upscale factor"),
):
    """POST /enhance?outscale=4. Form: image=<file>. Returns JSON: output_image (base64), scale, time."""
    image_bytes = await image.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    lr = preprocess(img)

    def run_inference():
        with torch.no_grad():
            sr = gen(lr)
        return postprocess(sr)

    t0 = time.perf_counter()
    sr_img = await asyncio.to_thread(run_inference)
    elapsed = time.perf_counter() - t0
    buf = io.BytesIO()
    sr_img.save(buf, format="PNG")
    buf.seek(0)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return {"output_image": b64, "scale": config.UPSCALE_FACTOR, "time": round(elapsed, 2)}


@app.post("/super-resolve")
async def super_resolve(file: UploadFile = File(...)):
    """
    Endpoint:
    POST /super-resolve

    Accepts:
        form-data: file=<image>

    Returns:
        Side-by-side image:
        [Original]   [Super-Resolved]
    """

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Preprocess
    lr = preprocess(image)

    # Super resolve
    with torch.no_grad():
        sr = gen(lr)

    sr_img = postprocess(sr)

    # Resize original to match SR size
    orig_resized = image.resize(sr_img.size, Image.BICUBIC)

    # Create side-by-side canvas with gap
    gap = 20  # horizontal gap in pixels
    w, h = sr_img.size

    combined = Image.new("RGB", (w * 2 + gap, h), (20, 20, 20))
    combined.paste(orig_resized, (0, 0))
    combined.paste(sr_img, (w + gap, 0))

    # Send to frontend
    buf = io.BytesIO()
    combined.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)