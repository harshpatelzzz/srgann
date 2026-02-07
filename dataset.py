import torch
from torch.utils.data import Dataset
from PIL import Image
import numpy as np
import os
import config


class MyImageFolder(Dataset):
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.img_names = os.listdir(root_dir)
        # Filter for image files
        self.img_names = [
            img for img in self.img_names
            if img.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))
        ]

    def __len__(self):
        return len(self.img_names)

    def __getitem__(self, index):
        img_name = self.img_names[index]
        img_path = os.path.join(self.root_dir, img_name)
        image = Image.open(img_path).convert("RGB")
        image = np.asarray(image)

        # Apply transformations to the high-res image
        augmented = config.both_transforms(image=image)
        image = augmented["image"]

        # Create low-res version
        low_res = config.lowres_transform(image=image)["image"]
        high_res = config.highres_transform(image=image)["image"]

        return low_res, high_res
