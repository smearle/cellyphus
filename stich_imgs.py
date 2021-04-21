import cv2
import os
import numpy as np
from PIL import Image
from varname import nameof

if not os.path.isdir('imgs/processed'):
    os.mkdir('imgs/processed')

dwarves = cv2.imread("imgs/Dwarf Fortress/raw/graphics/Vordak/dwarves.png", cv2.IMREAD_UNCHANGED)
misc = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_32x32.png", cv2.IMREAD_UNCHANGED)
dec = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations.png", cv2.IMREAD_UNCHANGED)
#dec_2 = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations_2.png", cv2.IMREAD_UNCHANGED)
water = cv2.imread("imgs/sprites/water.png", cv2.IMREAD_UNCHANGED)
amphibians = cv2.imread("imgs/Dwarf Fortress/raw/graphics/amphibians.png", cv2.IMREAD_UNCHANGED)
domestic = cv2.imread("imgs/Dwarf Fortress/raw/graphics/domestic.png", cv2.IMREAD_UNCHANGED)
constructions = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_constructions.png", cv2.IMREAD_UNCHANGED)
kobolds = cv2.imread("imgs/Dwarf Fortress/raw/graphics/Vordak/kobolds.png", cv2.IMREAD_UNCHANGED)
furniture = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_furniture.png", cv2.IMREAD_UNCHANGED)
decorations = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations.png", cv2.IMREAD_UNCHANGED)

def im_coords(im, x0, y0):
    x1, y1 = x0 + 1, y0 + 1
    return im[x0*w:x1*w, y0*w:y1*w]


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
    }

def write_img(img, name):
    cv2.imwrite('imgs/{}.png'.format(name), img)
    img = Image.fromarray(img)
    im_rgba = img.copy()
    im_rgba.putalpha(128)
    im_rgba.save('imgs/processed/alpha_{}.png'.format(name))



for name, img in img_names.items():
    write_img(img, name)

tiles = (player, grass, shrub, tree, water, frog, dog, small_cow, wall, goblin, door, bed, fire)
v = np.concatenate(tiles, axis=1)



cv2.imwrite('tileset.png', v)
