import torch
import torch.nn as nn
from torchvision.models import vgg19
import config

class VGGLoss(nn.Module):
    def __init__(self):
        super().__init__()
        self.vgg = vgg19(pretrained=True).features[:36].eval().to(config.DEVICE)
        for p in self.vgg.parameters():
            p.requires_grad = False

        self.loss = nn.MSELoss()

        self.register_buffer(
            "mean", torch.tensor([0.485, 0.456, 0.406]).view(1,3,1,1)
        )
        self.register_buffer(
            "std", torch.tensor([0.229, 0.224, 0.225]).view(1,3,1,1)
        )

    def forward(self, input, target):
        # input/target are in [-1,1] → convert to [0,1]
        input = (input + 1) / 2
        target = (target + 1) / 2

        input = (input - self.mean) / self.std
        target = (target - self.mean) / self.std

        vgg_input = self.vgg(input)
        vgg_target = self.vgg(target)

        return self.loss(vgg_input, vgg_target)
