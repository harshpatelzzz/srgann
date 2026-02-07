# import torch
# import numpy as np
# from PIL import Image
# import albumentations as A
# import config
# from model import Generator
# from utils import load_checkpoint


# def tensor_to_pil(t):
#     t = t.squeeze(0).permute(1, 2, 0).cpu().numpy()
#     t = (t * 255.0).clip(0, 255).astype(np.uint8)
#     return Image.fromarray(t)


# def main():
#     device = config.DEVICE

#     # -------- Load Generator --------
#     gen = Generator().to(device)
#     opt = torch.optim.Adam(gen.parameters(), lr=config.LEARNING_RATE)
#     load_checkpoint(config.CHECKPOINT_GEN, gen, opt, config.LEARNING_RATE)
#     gen.eval()

#     # -------- Load Image --------
#     img_path = "new_data/553_jpg.rf.6fd8c2660edb36507cd2876d824539ba.jpg"
#     img = Image.open(img_path).convert("RGB")
#     img_np = np.asarray(img)

#     h, w, _ = img_np.shape
#     print("Original:", h, w)

#     # -------- Downscale --------
#     down = A.Resize(height=h // 4, width=w // 4, interpolation=Image.BICUBIC)
#     lr_img = down(image=img_np)["image"]

#     print("Low-res:", lr_img.shape)

#     # -------- Normalize to [-1,1] --------
#     lr_tensor = config.test_transform(image=lr_img)["image"].unsqueeze(0).to(device)

#     # -------- Super Resolve --------
#     with torch.no_grad():
#         sr = gen(lr_tensor)

#     print("SR tensor:", sr.shape)

#     # -------- De-normalize --------
#     sr = (sr + 1) / 2.0

#     # -------- Save with PIL (REAL SIZE) --------
#     sr_pil = tensor_to_pil(sr)
#     sr_pil.save("saved/sr_full.png")

#     print("Saved: saved/sr_full.png")


# if __name__ == "__main__":
#     main()

import torch
from PIL import Image
from torchvision.utils import save_image
import torchvision.transforms.functional as TF
import torch.nn.functional as F

import config
from metrics import compute_metrics
from model import Generator
from utils import load_checkpoint


# ------------------------
# Load Generator
# ------------------------
gen = Generator().to(config.DEVICE)
opt = torch.optim.Adam(gen.parameters(), lr=config.LEARNING_RATE)

load_checkpoint(config.CHECKPOINT_GEN, gen, opt, config.LEARNING_RATE)
gen.eval()


# ------------------------
# Config
# ------------------------
HR_PATH = "new_data/791_jpg.rf.6a89cb5772bdebe9419ef64f60461f70.jpg"   # any HR image
UPSCALE = config.UPSCALE_FACTOR   # usually 4
SAVE_PATH = "saved/compare.png"


# ------------------------
# Load HR
# ------------------------
hr_img = Image.open(HR_PATH).convert("RGB")
hr = TF.to_tensor(hr_img).unsqueeze(0).to(config.DEVICE)

# normalize to [-1, 1]
hr = hr * 2 - 1


# ------------------------
# Create LR from HR (like training)
# ------------------------
lr = F.interpolate(
    hr,
    scale_factor=1 / UPSCALE,
    mode="bicubic",
    align_corners=False,
)


# ------------------------
# Super Resolve
# ------------------------
with torch.no_grad():
    sr = gen(lr)


# ------------------------
# Upsample LR for visualization
# ------------------------
lr_up = F.interpolate(
    lr,
    size=sr.shape[-2:],
    mode="bicubic",
    align_corners=False,
)


# ------------------------
# De-normalize to [0,1]
# ------------------------
def denorm(x):
    return x * 0.5 + 0.5

lr_up = denorm(lr_up)
sr = denorm(sr)
hr = denorm(hr)


# ------------------------
# Match HR size exactly (safety)
# ------------------------
hr = F.interpolate(hr, size=sr.shape[-2:], mode="bilinear", align_corners=False)


# ------------------------
# Metrics
# ------------------------
metrics = compute_metrics(sr, hr)
error = metrics["mse"]
accuracy = metrics["psnr"]


# ------------------------
# Concatenate: LR | SR | HR
# ------------------------
comparison = torch.cat([lr_up, sr, hr], dim=3)

save_image(comparison, SAVE_PATH)
print(f"Error (MSE): {error:.6f}")
print(f"Accuracy (PSNR dB): {accuracy:.2f}")
print(f"Saved: {SAVE_PATH}")

