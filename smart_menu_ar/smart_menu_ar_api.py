# Smart Menu 3D AR API - Backend Service
# Deployed on CodeWords as service: smart_menu_ar_api_9429c6e1
# This file is the backend API for the QR-to-3D AR smart menu system.
# It serves menu items, generates QR codes, and tracks analytics.
#
# Frontend Apps:
#   QR Generator: https://smart-menu-qr.codewords.run
#   3D AR Viewer: https://smart-menu-ar.codewords.run

# /// script
# requires-python = "==3.11.*"
# dependencies = [
#   "codewords-client==0.4.5",
#   "fastapi==0.116.1",
#   "qrcode==8.0",
#   "Pillow==11.1.0"
# ]
# [tool.env-checker]
# env_vars = [
#   "PORT=8000",
#   "LOGLEVEL=INFO",
#   "CODEWORDS_API_KEY",
#   "CODEWORDS_RUNTIME_URI"
# ]
# ///

from __future__ import annotations

import asyncio
import base64
import io
import json
import time
from typing import Literal

import qrcode
from codewords_client import logger, redis_client, run_service
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

INITIAL_SEED = [
    {"id": 1, "name": "Classic Burger", "slug": "classic-burger", "description": "Juicy beef patty with lettuce, tomato, cheese, and our secret sauce.", "price": 8.99, "category": "mains", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/Astronaut.glb", "model_scale": 1.0, "nutrition": {"calories": 650, "protein": "35g", "carbs": "45g"}, "tags": ["popular", "beef"], "available": True},
    {"id": 2, "name": "Margherita Pizza", "slug": "margherita-pizza", "description": "Hand-tossed with San Marzano tomato sauce, fresh mozzarella, basil.", "price": 12.99, "category": "mains", "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb", "model_scale": 0.8, "nutrition": {"calories": 850, "protein": "28g", "carbs": "95g"}, "tags": ["vegetarian", "popular"], "available": True},
    {"id": 3, "name": "Caesar Salad", "slug": "caesar-salad", "description": "Crisp romaine, parmesan, croutons, creamy Caesar dressing.", "price": 7.49, "category": "starters", "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/Astronaut.glb", "model_scale": 0.6, "nutrition": {"calories": 320, "protein": "12g", "carbs": "18g"}, "tags": ["healthy", "vegetarian"], "available": True},
    {"id": 4, "name": "Chocolate Lava Cake", "slug": "chocolate-lava-cake", "description": "Warm cake with molten center, served with vanilla ice cream.", "price": 6.99, "category": "desserts", "image_url": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb", "model_scale": 0.5, "nutrition": {"calories": 480, "protein": "6g", "carbs": "58g"}, "tags": ["popular", "sweet"], "available": True},
    {"id": 5, "name": "Grilled Chicken Wings", "slug": "grilled-chicken-wings", "description": "Smoky wings in buffalo sauce with blue cheese dip.", "price": 9.49, "category": "starters", "image_url": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/Astronaut.glb", "model_scale": 0.7, "nutrition": {"calories": 520, "protein": "42g", "carbs": "8g"}, "tags": ["spicy", "popular"], "available": True},
    {"id": 6, "name": "Iced Matcha Latte", "slug": "iced-matcha-latte", "description": "Premium Japanese matcha whisked with oat milk over ice.", "price": 4.99, "category": "drinks", "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400", "model_url": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb", "model_scale": 0.4, "nutrition": {"calories": 180, "protein": "4g", "carbs": "22g"}, "tags": ["cold", "healthy"], "available": True},
]

# See full code at: https://codewords.agemo.ai (service: smart_menu_ar_api_9429c6e1)
