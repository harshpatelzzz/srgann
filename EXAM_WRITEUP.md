# Image Super-Resolution Using SRGAN: Abstract, Objectives, Methodology, and Conclusion

---

## Abstract

This project implements a complete **Single Image Super-Resolution (SISR)** system using a **Generative Adversarial Network (GAN)** based on the SRGAN architecture. The system takes a low-resolution image as input and produces a high-resolution (4× upscaled) output with improved perceptual quality. The implementation includes a PyTorch-based Generator and Discriminator, a FastAPI backend for inference, and a React-based dashboard that provides (i) image upload and processing with before–after comparison, (ii) end-to-end pipeline visualization from upload to output, (iii) GAN architecture and training-loop visualization, and (iv) simulated training metrics and loss charts. The work demonstrates the integration of deep learning models with a modern web stack for both inference and educational visualization of the SRGAN pipeline.

**Keywords:** Super-resolution, SRGAN, GAN, Generator, Discriminator, PyTorch, FastAPI, React.

---

## Objectives

1. **Implement SRGAN**  
   To implement the SRGAN architecture (Generator with residual blocks and sub-pixel convolution, Discriminator for adversarial training) using PyTorch and train or load a pre-trained model for 4× image super-resolution.

2. **Deploy an inference API**  
   To expose the trained model via a REST API (FastAPI) supporting image upload, preprocessing, model inference, and return of the super-resolved image (e.g. base64 or side-by-side output).

3. **Build a user-facing dashboard**  
   To provide a web interface (React + TypeScript + Tailwind) where users can upload images, select scale factors, trigger processing, and view results with metrics (processing time, scale factor, resolution).

4. **Visualize the pipeline and architecture**  
   To create interactive visualizations of (a) the end-to-end data flow (upload → frontend → backend → preprocessing → generator → discriminator → output) and (b) the Generator–Discriminator architecture and training loop, for understanding and presentation.

5. **Simulate training metrics**  
   To display simulated training behaviour (Generator loss, Discriminator loss, PSNR over epochs) and live logs in a dashboard format for demonstration and analysis.

---

## Methodology

### Model architecture

- **Generator:** Accepts a low-resolution image (e.g. 64×64), passes it through an initial convolutional layer, 16 residual blocks (each with two conv blocks and a skip connection), a final conv block added to the initial features, two upsampling blocks using Pixel Shuffle (2× each, giving 4× total), and a final conv layer with tanh activation to produce the high-resolution output (e.g. 256×256).
- **Discriminator:** A convolutional network that classifies patches as real or generated (adversarial loss). It uses multiple conv blocks with increasing channels and a final dense layer with sigmoid output for the realness score.
- **Training (optional):** The Generator is trained to fool the Discriminator while minimizing a combination of content loss (e.g. VGG or pixel-wise) and adversarial loss; the Discriminator is trained to distinguish real high-resolution images from generated ones. Training can be run via `train.py` with configurable dataset and hyperparameters.

### Backend (FastAPI)

- **Endpoints:**  
  - `GET /health` for service health.  
  - `POST /enhance`: accepts an image (form field), optional scale factor (query); returns JSON with base64 output image, scale factor, and processing time.  
  - `POST /super-resolve`: accepts an image file; returns a single PNG with original and super-resolved images side by side.
- **Preprocessing:** Input images are normalized (e.g. to [−1, 1]) and optionally resized (max low-res side length, e.g. 256 px) to keep inference time manageable on CPU/GPU.
- **Inference:** The Generator is loaded from a checkpoint (`gen.pth.tar`); images are preprocessed, passed through the model, postprocessed (e.g. denormalize, clamp), and returned.

### Frontend (React dashboard)

- **Process image page:** Upload area (drag-and-drop, JPG/PNG, max size 10 MB), scale factor selector (2×/4×), “Process image” button, processing steps animation, before–after comparison with draggable slider, metrics panel (scale factor, processing time, resolution), and logs panel.
- **Model pipeline page:** Step-by-step visualization of the pipeline (upload → frontend → backend → preprocessing → generator → discriminator → post-processing → output) with optional real inference using the same backend.
- **GAN architecture page:** Visualization of Generator (feature extraction, residual blocks, upsampling) and Discriminator (conv blocks, dense, sigmoid), training feedback loop, and simulated loss curves (Recharts).
- **Dashboard (training):** Simulated training run with Generator/Discriminator loss and PSNR charts over epochs, live logs, and metrics (epoch, losses, status).

### Technology stack

- **Backend:** Python 3.10+, PyTorch, FastAPI, Uvicorn, Pillow, Albumentations.  
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Axios.  
- **API contract:** Form-based upload and JSON/base64 or PNG response; frontend uses `VITE_API_URL` (default `http://localhost:8000`) for the API base URL.

---

## Innovative Component

1. **Unified dashboard for inference and education**  
   A single React application combines (i) production-style image upload and processing with before–after comparison and download, and (ii) educational visualizations (pipeline flow, GAN architecture, training loop) and simulated training metrics. This helps users both run super-resolution and understand how the model and data flow work.

2. **Interactive pipeline and architecture visualization**  
   The Model Pipeline and GAN Architecture pages use step-by-step highlighting and animations (Framer Motion) to show how an image moves from upload through preprocessing, Generator, Discriminator, and post-processing. The training loop (feedback from Discriminator to Generator) is shown with a clear visual flow, improving interpretability of the SRGAN design.

3. **REST API with dual response formats**  
   The backend supports both a “developer-friendly” JSON response with base64 output and metrics (`/enhance`) and a “user-friendly” single side-by-side PNG (`/super-resolve`), allowing the same model to serve different frontend and integration needs.

4. **Input size limiting for reliable inference**  
   Large inputs are automatically downscaled (e.g. max low-res side 256 px) before inference so that processing completes within a reasonable time and within frontend timeout limits, improving usability without changing the core model.

5. **Simulated training dashboard**  
   The dashboard includes a dedicated Training view with simulated Generator/Discriminator loss and PSNR over epochs and live logs, enabling demonstration of training behaviour without running actual training in the browser.

---

## Results

- **Inference:** The system successfully loads the trained Generator checkpoint and produces 4× super-resolved images. Users can upload JPG/PNG images, choose scale factor (2×/4×), and obtain the output with processing time and resolution information. The before–after slider and download option improve usability.
- **API:** The FastAPI backend serves `/health`, `/enhance`, and `/super-resolve` as specified. The frontend connects to the API, displays backend status (online/offline), and handles errors and timeouts (e.g. 5-minute timeout for large images).
- **Visualizations:** The Model Pipeline and GAN Architecture pages run step-by-step simulations and animate the data flow and model structure. The Dashboard Training page updates loss and PSNR charts and logs in real time during the simulated run.
- **Performance:** With input size limiting (e.g. max 256 px on the long side for the low-res input), inference typically completes in under a minute on CPU, avoiding timeouts. Processing time and scale factor are reported in the metrics panel.

---

## Conclusion

The project delivers a full SRGAN-based image super-resolution system with a FastAPI backend and a React dashboard. Objectives were met: (1) SRGAN (Generator and Discriminator) is implemented in PyTorch; (2) inference is exposed via REST endpoints with health check, JSON/base64 output, and side-by-side PNG; (3) a modern web UI supports upload, processing, before–after comparison, and download; (4) pipeline and GAN architecture are visualized for teaching and presentation; and (5) simulated training metrics and logs are shown in a dashboard. The main innovative aspects are the combination of production inference and educational visualizations in one app, interactive pipeline and architecture views, flexible API design, and input size limiting for stable, user-friendly inference. The system is suitable for demonstrations, further experimentation (e.g. different scales, losses, or datasets), and integration into larger applications. Future work could include GPU-optimized inference, additional metrics (e.g. PSNR/SSIM on real data), and optional fine-tuning or training from the same codebase.
