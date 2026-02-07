import torch
import config
from torch import nn
from torch import optim
from utils import load_checkpoint, save_checkpoint, plot_examples
from loss import VGGLoss
from torch.utils.data import DataLoader
from model import Generator, Discriminator
from tqdm import tqdm
from dataset import MyImageFolder

torch.backends.cudnn.benchmark = True

def pretrain_gen_fn(loader, gen, opt_gen, l1, vgg_loss):
    loop = tqdm(loader, leave=True)

    for low_res, high_res in loop:
        low_res = low_res.to(config.DEVICE)
        high_res = high_res.to(config.DEVICE)

        fake = gen(low_res)

        pixel_loss = l1(fake, high_res)
        loss_for_vgg = 0.006 * vgg_loss(fake, high_res)

        gen_loss = pixel_loss + loss_for_vgg

        opt_gen.zero_grad()
        gen_loss.backward()
        opt_gen.step()

def train_fn(loader, disc, gen, opt_gen, opt_disc, bce, vgg_loss, l1):
    loop = tqdm(loader, leave=True)

    for idx, (low_res, high_res) in enumerate(loop):
        high_res = high_res.to(config.DEVICE)
        low_res = low_res.to(config.DEVICE)

        fake = gen(low_res)

        # -------- Train Discriminator (every 2 steps) --------
        disc_real = disc(high_res)
        disc_fake = disc(fake.detach())

        disc_loss_real = bce(
            disc_real, torch.ones_like(disc_real) - 0.1 * torch.rand_like(disc_real)
        )
        disc_loss_fake = bce(disc_fake, torch.zeros_like(disc_fake))
        loss_disc = disc_loss_real + disc_loss_fake

        if idx % 2 == 0:
            opt_disc.zero_grad()
            loss_disc.backward()
            opt_disc.step()

        # -------- Train Generator --------
        disc_fake = disc(fake)

        pixel_loss = 1.0 * l1(fake, high_res)
        loss_for_vgg = 0.003 * vgg_loss(fake, high_res)
        adversarial_loss = 3e-4 * bce(disc_fake, torch.ones_like(disc_fake))

        gen_loss = pixel_loss + loss_for_vgg + adversarial_loss

        opt_gen.zero_grad()
        gen_loss.backward()
        opt_gen.step()

        if idx % 200 == 0:
            plot_examples("test_images/", gen)



def main():
    dataset = MyImageFolder(root_dir="new_data/")
    loader = DataLoader(
        dataset,
        batch_size=config.BATCH_SIZE,
        shuffle=True,
        pin_memory=True,
        num_workers=config.NUM_WORKERS,
    )
    gen = Generator().to(config.DEVICE)
    disc = Discriminator().to(config.DEVICE)
    opt_gen = optim.Adam(gen.parameters(), lr=config.LEARNING_RATE, betas=(0.9, 0.999))
    opt_disc = optim.Adam(disc.parameters(), lr=config.LEARNING_RATE, betas=(0.9, 0.999))
    mse = nn.MSELoss()
    bce = nn.BCEWithLogitsLoss()
    vgg_loss = VGGLoss()

    if config.LOAD_MODEL:
        load_checkpoint(
            config.CHECKPOINT_GEN,
            gen,
            opt_gen,
            config.LEARNING_RATE,
        )
        load_checkpoint(
           config.CHECKPOINT_DISC, disc, opt_disc, config.LEARNING_RATE,
        )
    l1 = nn.L1Loss()


    print("==== Adversarial Training ====")
    for epoch in range(config.NUM_EPOCHS):
        print(f"GAN Epoch [{epoch+1}/{config.NUM_EPOCHS}]")
        train_fn(loader, disc, gen, opt_gen, opt_disc, bce, vgg_loss, l1)

        if config.SAVE_MODEL:
            save_checkpoint(gen, opt_gen, filename=config.CHECKPOINT_GEN)
            save_checkpoint(disc, opt_disc, filename=config.CHECKPOINT_DISC)



if __name__ == "__main__":
    main()