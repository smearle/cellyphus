''' This is a ridiculous script to process a bunch of images for the game.'''
import cv2
import os
import numpy as np
from PIL import Image
from varname import nameof

if not os.path.isdir('imgs/processed'):
    os.mkdir('imgs/processed')

def imread(im_path):
    return cv2.imread(im_path, cv2.IMREAD_UNCHANGED)

# Load images
dwarves = cv2.imread("all_imgs/Dwarf Fortress/raw/graphics/Vordak/dwarves.png", cv2.IMREAD_UNCHANGED)
misc = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_32x32.png", cv2.IMREAD_UNCHANGED)
dec = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_decorations.png", cv2.IMREAD_UNCHANGED)
items = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_items.png", cv2.IMREAD_UNCHANGED)
#dec_2 = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_decorations_2.png", cv2.IMREAD_UNCHANGED)
water = cv2.imread("imgs/sprites/water.png", cv2.IMREAD_UNCHANGED)
amphibians = cv2.imread("all_imgs/Dwarf Fortress/raw/graphics/amphibians.png", cv2.IMREAD_UNCHANGED)
domestic = cv2.imread("all_imgs/Dwarf Fortress/raw/graphics/domestic.png", cv2.IMREAD_UNCHANGED)
constructions = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_constructions.png", cv2.IMREAD_UNCHANGED)
kobolds = cv2.imread("all_imgs/Dwarf Fortress/raw/graphics/Vordak/kobolds.png", cv2.IMREAD_UNCHANGED)
furniture = cv2.imread("all_imgs/Dwarf Fortress/data/art/_Meph_furniture.png", cv2.IMREAD_UNCHANGED)
decorations = imread("all_imgs/Dwarf Fortress/data/art/_Meph_decorations.png")
flame_emoji = imread("all_imgs/fire_emoji_32.png")
ant_emoji = imread("all_imgs/ant_emoji_32.png")


def im_coords(im, x0, y0):
    ''' Get a 32*32 tile from some x y in a given image'''
    x1, y1 = x0 + 1, y0 + 1
    return im[x0*w:x1*w, y0*w:y1*w]

# Cut out the tiles from the loaded images
w = 32
player = misc[8*w:9*w, 12*w:13*w]
#grass = misc[1*w:2*w, 7*w:8*w]
grass = im_coords(misc, 11, 7)
shrub = misc[4*w:5*w, 6*w:7*w]
tree = misc[-7*w:-6*w, 12*w:13*w]
#water_tiles = dec_2[-2*w:-1*w, 10*w:11*w]
water = water[0*w:1*w, 0*w:1*w]
frog = amphibians[0*w:1*w, 0*w:1*w]
dog = domestic[0*2:1*w, 0*w:1*w]
small_cow = im_coords(domestic, 1, 5)
wall = im_coords(constructions, 2, 12)
goblin = im_coords(kobolds, 0, 0)
door = im_coords(furniture, 2, 15)
bed = im_coords(furniture, 2, 6)
fire = im_coords(decorations, 15, 15)
bridge = im_coords(items, 7, 8)
redbrick = im_coords(decorations, 0, 11)
breakable_redbrick = im_coords(decorations, 0, 0)
flame = im_coords(flame_emoji, 0, 0)
ant = im_coords(ant_emoji, 0, 0)

# A dictionary with all the tiles and their names
img_names = {
    'player': player,
    'frog': frog,
    'grass': grass,
    'water': water,
    'shrub': shrub,
    'bed': bed,
    'fire': fire,
    'dog': dog,
    'goblin': goblin,
    'door': door,
    'tree': tree,
    'wall': wall,
    'small_cow': small_cow,
    'bridge': bridge,
    'redbrick': redbrick,
    'breakable_redbrick': breakable_redbrick,
    'flame': flame,
    'ant': ant,
    }

def write_img(img, name):
    '''Write an image with some name. Also get a n alpha version for "blueprint" items.'''
    cv2.imwrite('imgs/{}.png'.format(name), img)
    # TODO: alpha should only apply to build items?
    img = Image.fromarray(img)
    im_rgba = img.copy()
    im_rgba.putalpha(128)
    im_rgba.save('imgs/processed/alpha_{}.png'.format(name))


for name, img in img_names.items():
    write_img(img, name)

# Produce a tileset for ROT.js
tiles = (player, grass, shrub, tree, water, frog, dog, small_cow, wall, goblin, door, bed, fire, bridge, flame, redbrick, ant,
        breakable_redbrick)
v = np.concatenate(tiles, axis=1)
cv2.imwrite('tileset.png', v)
