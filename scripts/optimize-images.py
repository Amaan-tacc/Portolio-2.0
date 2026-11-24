"""Generate responsive copies; retain every original and deduplicate identical artwork.

Run with Python + Pillow before npm run build when bundled images change.
"""
from pathlib import Path
from hashlib import sha256
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parents[1]
public = root / 'public'
out = public / 'assets' / 'responsive'
out.mkdir(parents=True, exist_ok=True)
manifest = {}
for source in sorted((public / 'assets').rglob('*')):
    if out in source.parents or source.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        continue
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        width, height = image.size
        if width <= 480:
            continue
        key = sha256(source.read_bytes()).hexdigest()[:16]
        candidates = []
        for size in (480, 960, 1440):
            if size >= width:
                continue
            target = out / f'{key}-{size}.webp'
            if not target.exists():
                variant = image.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
                variant.save(target, 'WEBP', quality=94, method=6)
            candidates.append(f'/assets/responsive/{target.name} {size}w')
        url = '/' + source.relative_to(public).as_posix()
        candidates.append(f'{url} {width}w')
        manifest[url] = {'width': width, 'height': height, 'srcSet': ', '.join(candidates)}
(root / 'src' / 'data' / 'responsiveImages.json').write_text(json.dumps(manifest, separators=(',', ':')), encoding='utf-8')
print(f'{len(manifest)} images mapped; {len(list(out.glob("*.webp")))} responsive copies. Originals retained.')
