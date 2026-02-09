# SRGAN — Image Super Resolution

PyTorch implementation of **SRGAN** (Super-Resolution Generative Adversarial Network) with a FastAPI backend and a React dashboard for inference, pipeline visualization, and training metrics.

Based on [Photo-Realistic Single Image Super-Resolution Using a Generative Adversarial Network](https://arxiv.org/abs/1609.04802).

---

## Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- Trained generator checkpoint: `gen.pth.tar` in the project root (required for inference)

---

## Quick start

### 1. Backend (FastAPI)

```bash
# From project root (srgan/)
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate     # Linux / macOS

pip install torch torchvision pillow tqdm albumentations uvicorn fastapi python-multipart

python main.py
```

Backend runs at **http://localhost:8000**.  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 2. Frontend (React dashboard)

```bash
# From project root
cd pipeline-ui
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (or the port Vite prints). Use the nav to open:

- **Model Pipeline** — pipeline flow + real inference (upload image, process)
- **Process image** — upload, scale 2×/4×, view result and metrics
- **GAN Architecture** — Generator/Discriminator and training loop visualization
- **Dashboard** — training charts (simulated), logs, metrics

---

## How to use

### Process an image (upload UI)

1. Start backend and frontend (see above).
2. Open the app and click **Process image** in the top nav.
3. Upload a JPG or PNG (max 10 MB). Optionally choose **Scale factor** (2× or 4×).
4. Click **Process image**. The request is sent to the backend; the result appears with a before/after slider and metrics (scale, time, resolution).
5. Use **Download output** to save the super-resolved image.

Large images are resized before processing so inference finishes in a reasonable time.

### Model Pipeline (visual + real inference)

1. Go to **Model Pipeline**.
2. In **Real inference**, upload an image and click **Process image**. The backend returns a side-by-side original | super-resolved image.
3. Use **Run Inference Simulation** to step through the pipeline (upload → frontend → backend → preprocessing → generator → discriminator → post-processing → output) with no backend call.

### GAN Architecture

1. Go to **GAN Architecture**.
2. Use **Run Training Simulation** to animate the Generator and Discriminator and the training loop. Loss charts and logs update (simulation only).

### Dashboard (training view)

1. Go to **Dashboard** → **Training**.
2. Use **Start Training** to run a simulated training: Generator Loss, Discriminator Loss, and PSNR charts update over epochs. Logs appear in the right panel.

---

## API reference

| Method | Endpoint        | Description |
|--------|-----------------|-------------|
| GET    | `/health`       | Returns `{ "status": "ok" }`. |
| POST   | `/enhance`      | Form: `image` (file). Query: `outscale` (1–4, default 4). Returns `{ "output_image": "<base64>", "scale": 4, "time": <seconds> }`. |
| POST   | `/super-resolve`| Form: `file` (image). Returns a single PNG: original and super-resolved side by side. |

---

## Environment variables

- **Backend:** none required.
- **Frontend (pipeline-ui):**  
  - `VITE_API_URL` — API base URL (default: `http://localhost:8000`). Set if the backend runs on another host or port.

Example:

```bash
# .env in pipeline-ui/
VITE_API_URL=http://localhost:8000
```

---

## Training (optional)

To train the model yourself:

```bash
# Activate venv, then:
pip install torch torchvision pillow tqdm albumentations

# Prepare data: place HR images in a folder and point config/dataset to it, then:
python train.py
```

Checkpoints are saved as `gen.pth.tar` and `disc.pth.tar`. Use them with `main.py` and the dashboard.

---

## Project structure

```
srgan/
├── main.py              # FastAPI app: /health, /enhance, /super-resolve
├── config.py            # Training and model config
├── model.py             # Generator and Discriminator
├── dataset.py, loss.py, metrics.py, utils.py
├── train.py, test.py
├── index.html           # Simple static upload page (optional)
├── pipeline-ui/         # React + Vite dashboard
│   ├── src/
│   │   ├── pages/       # ModelPipeline, GANArchitecture, ImageUploadDashboard, Training, etc.
│   │   ├── components/
│   │   ├── services/   # api.ts (axios, enhanceImage, checkHealth)
│   │   └── layouts/
│   └── package.json
└── README.md
```

---

## References

1. [SRGAN paper (arXiv)](https://arxiv.org/abs/1609.04802)
2. [SRGAN on Papers with Code](https://paperswithcode.com/method/srgan)
3. [Video walkthrough](https://www.youtube.com/watch?v=7FO9qDOhRCc)
