import torch
import torch.nn.functional as F


def compute_metrics(sr, hr, max_val: float = 1.0, eps: float = 1e-10):
    """Compute basic SR metrics for tensors in [0, 1]."""
    mse = F.mse_loss(sr, hr)
    l1 = F.l1_loss(sr, hr)
    psnr = 10 * torch.log10(max_val * max_val / (mse + eps))
    return {"mse": mse.item(), "mae": l1.item(), "psnr": psnr.item()}
