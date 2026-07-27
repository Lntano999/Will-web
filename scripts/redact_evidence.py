"""Create irreversible, public-safe award evidence derivatives.

The original documents stay outside the repository. This script paints opaque
rectangles over privacy-sensitive regions and verifies those regions after the
output files have been encoded.
"""

from __future__ import annotations

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat


NAVY = (15, 34, 57)

MODEL_REFERENCE_SIZE = (1241, 1754)
MODEL_BOXES = (
    (694, 856, 995, 920),  # Teammate names; keep 唐嘉辰 visible.
    (300, 1540, 472, 1600),  # Certificate number after "NO.:".
    (842, 1436, 952, 1464),  # Repeated serial inside the right seal.
)

CN_REFERENCE_SIZE = (908, 640)
CN_BOXES = (
    (724, 26, 855, 68),  # CPFP certificate number.
)


def scaled_box(
    box: tuple[int, int, int, int],
    reference_size: tuple[int, int],
    actual_size: tuple[int, int],
) -> tuple[int, int, int, int]:
    """Scale a reference-image box to the source image's actual dimensions."""

    reference_width, reference_height = reference_size
    actual_width, actual_height = actual_size
    x_scale = actual_width / reference_width
    y_scale = actual_height / reference_height
    left, top, right, bottom = box
    return (
        round(left * x_scale),
        round(top * y_scale),
        round(right * x_scale),
        round(bottom * y_scale),
    )


def paint_redactions(
    source: Path,
    destination: Path,
    reference_size: tuple[int, int],
    boxes: tuple[tuple[int, int, int, int], ...],
    image_format: str,
) -> tuple[tuple[int, int, int, int], ...]:
    """Paint the configured regions and save a flattened RGB derivative."""

    with Image.open(source) as original:
        image = original.convert("RGB")

    actual_boxes = tuple(
        scaled_box(box, reference_size, image.size) for box in boxes
    )
    draw = ImageDraw.Draw(image)
    for box in actual_boxes:
        draw.rectangle(box, fill=NAVY)

    destination.parent.mkdir(parents=True, exist_ok=True)
    save_options: dict[str, object] = {"optimize": True}
    if image_format == "JPEG":
        save_options.update({"quality": 94, "subsampling": 0})
    image.save(destination, format=image_format, **save_options)
    return actual_boxes


def verify_redactions(
    destination: Path,
    boxes: tuple[tuple[int, int, int, int], ...],
    *,
    lossless: bool,
) -> None:
    """Verify saved regions are opaque and contain no source-document detail."""

    with Image.open(destination) as saved:
        image = saved.convert("RGB")

    for box in boxes:
        left, top, right, bottom = box
        inset = 0 if lossless else 8
        region = image.crop((left + inset, top + inset, right - inset, bottom - inset))

        if lossless:
            colors = region.getcolors(maxcolors=2)
            if colors != [(region.width * region.height, NAVY)]:
                raise RuntimeError(f"Lossless redaction is not uniform: {destination} {box}")
            continue

        means = ImageStat.Stat(region).mean
        extrema = region.getextrema()
        if any(abs(mean - target) > 5 for mean, target in zip(means, NAVY)):
            raise RuntimeError(f"JPEG redaction mean color drifted: {destination} {box}")
        if any(high - low > 3 for low, high in extrema):
            raise RuntimeError(f"JPEG redaction retains visible detail: {destination} {box}")


def parse_args() -> ArgumentParser:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--modeling-render", type=Path, required=True)
    parser.add_argument("--cn-story", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    return parser


def main() -> None:
    args = parse_args().parse_args()

    modeling_output = (
        args.out_dir / "modeling-csee-cup-2026-third-prize-redacted.png"
    )
    cn_output = args.out_dir / "cn-story-2026-guangdong-second-prize-redacted.jpg"

    modeling_boxes = paint_redactions(
        args.modeling_render,
        modeling_output,
        MODEL_REFERENCE_SIZE,
        MODEL_BOXES,
        "PNG",
    )
    cn_boxes = paint_redactions(
        args.cn_story,
        cn_output,
        CN_REFERENCE_SIZE,
        CN_BOXES,
        "JPEG",
    )

    verify_redactions(modeling_output, modeling_boxes, lossless=True)
    verify_redactions(cn_output, cn_boxes, lossless=False)

    print(f"Created {modeling_output}")
    print(f"Created {cn_output}")


if __name__ == "__main__":
    main()
