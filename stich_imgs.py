import cv2
import numpy as np

dwarves = cv2.imread("imgs/Dwarf Fortress/raw/graphics/Vordak/dwarves.png", cv2.IMREAD_UNCHANGED)
misc = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_32x32.png", cv2.IMREAD_UNCHANGED)
dec = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations.png", cv2.IMREAD_UNCHANGED)
#dec_2 = cv2.imread("imgs/Dwarf Fortress/data/art/_Meph_decorations_2.png", cv2.IMREAD_UNCHANGED)
water = cv2.imread("imgs/water.png", cv2.IMREAD_UNCHANGED)

w = 32

player = misc[8*w:9*w, 12*w:13*w]
grass = misc[1*w:2*w, 7*w:8*w]
shrub = misc[4*w:5*w, 6*w:7*w]
tree = misc[-7*w:-6*w, 12*w:13*w]
#water_tiles = dec_2[-2*w:-1*w, 10*w:11*w]
water = water[1*w:2*w, 1*w:2*w]

tiles = (player, grass, shrub, tree, water)
v = np.concatenate(tiles, axis=1)

cv2.imwrite('tileset.png', v)
