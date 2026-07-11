<?php

namespace App\Support;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Endroid\QrCode\Bacon\MatrixFactory;
use Endroid\QrCode\QrCode as EndroidQrCode;

/**
 * First-party QR generation and the single source of truth for QR rendering
 * (used by the authenticated batch-registration modal and the public og:image
 * route). Deliberately extension-free — none of svg(), png() or paddedOg() needs
 * gd or imagick, so the public og:image endpoint can't 500 on a lean runtime:
 *
 *   - svg(): inline SVG via BaconQrCode. The XML prolog is stripped so the
 *     markup embeds cleanly via innerHTML or an image/svg+xml response.
 *   - png(): square raster PNG hand-encoded from the QR module matrix (only
 *     zlib, always present). Social scrapers such as Facebook ignore SVG
 *     og:images, so the shared preview must be a PNG.
 *   - paddedOg(): the QR centered on a 1200x630 white canvas. This is the
 *     Open Graph aspect ratio (1.91:1), so social crawlers stop cropping the
 *     square code top/bottom. Used as the guaranteed fallback for the branded
 *     og:image card when gd is unavailable (see App\Support\OgImage).
 */
class QrCode
{
    public static function svg(string $text, int $size = 220): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size, 1),
            new SvgImageBackEnd,
        );
        $svg = (new Writer($renderer))->writeString($text);
        $start = strpos($svg, '<svg');

        return $start !== false ? substr($svg, $start) : $svg;
    }

    /**
     * Raw PNG bytes of the QR as a square image. Scaled to ~$targetSize px and
     * encoded as a grayscale PNG directly — no image extension required.
     */
    public static function png(string $text, int $targetSize = 512, int $marginModules = 4): string
    {
        ['dim' => $dim, 'rows' => $rows] = self::rasterRows($text, $targetSize, $marginModules);

        $scanlines = '';
        foreach ($rows as $row) {
            $scanlines .= "\x00".$row;
        }

        return self::encodePng($dim, $dim, $scanlines);
    }

    /**
     * The QR centered on a $width x $height (default 1200x630, the Open Graph
     * ratio) white grayscale canvas. Fixes the "clipped top/bottom" preview
     * without gd: the code sits, quiet zone intact, in a 1.91:1 frame so no
     * platform crops it. This is the fallback path when the branded gd card
     * can't be built.
     */
    public static function paddedOg(string $text, int $width = 1200, int $height = 630, int $qrTarget = 470): string
    {
        ['dim' => $dim, 'rows' => $rows] = self::rasterRows($text, min($qrTarget, $height, $width), 4);

        $left = max(0, intdiv($width - $dim, 2));
        $top = max(0, intdiv($height - $dim, 2));
        $whiteRow = str_repeat("\xFF", $width);
        $leftPad = str_repeat("\xFF", $left);
        $rightPad = str_repeat("\xFF", max(0, $width - $left - $dim));

        $scanlines = '';
        for ($y = 0; $y < $height; $y++) {
            $inBand = $y >= $top && $y < $top + $dim && isset($rows[$y - $top]);
            $scanlines .= "\x00".($inBand ? $leftPad.$rows[$y - $top].$rightPad : $whiteRow);
        }

        return self::encodePng($width, $height, $scanlines);
    }

    /**
     * Rasterize the QR to grayscale pixel rows (dark modules 0x00, light 0xFF),
     * quiet-zone margin included, scaled up to ~$targetSize px. Each returned
     * row is a $dim-byte string with no PNG filter prefix, so callers can embed
     * it in a larger canvas or emit it directly.
     *
     * @return array{dim: int, rows: list<string>}
     */
    private static function rasterRows(string $text, int $targetSize, int $marginModules): array
    {
        $matrix = (new MatrixFactory)->create(new EndroidQrCode($text));
        $count = $matrix->getBlockCount();
        $scale = max(1, intdiv($targetSize, $count + 2 * $marginModules));
        $dim = ($count + 2 * $marginModules) * $scale;

        $light = "\xFF";
        $dark = "\x00";
        $marginPixels = str_repeat($light, $marginModules * $scale);
        $lightRow = str_repeat($light, $dim);

        $rows = array_fill(0, $marginModules * $scale, $lightRow);
        for ($row = 0; $row < $count; $row++) {
            $pixels = $marginPixels;
            for ($col = 0; $col < $count; $col++) {
                $on = $matrix->getBlockValue($row, $col) === 1;
                $pixels .= str_repeat($on ? $dark : $light, $scale);
            }
            $pixels .= $marginPixels;
            for ($s = 0; $s < $scale; $s++) {
                $rows[] = $pixels;
            }
        }
        for ($i = 0; $i < $marginModules * $scale; $i++) {
            $rows[] = $lightRow;
        }

        return ['dim' => $dim, 'rows' => $rows];
    }

    /** Assemble a grayscale (color type 0, 8-bit) PNG from raw scanlines. */
    private static function encodePng(int $width, int $height, string $scanlines): string
    {
        $idat = gzcompress($scanlines, 9);

        if ($idat === false) {
            throw new \RuntimeException('Failed to deflate PNG image data.');
        }

        $ihdr = pack('NN', $width, $height)."\x08\x00\x00\x00\x00";

        return "\x89PNG\r\n\x1a\n"
            .self::pngChunk('IHDR', $ihdr)
            .self::pngChunk('IDAT', $idat)
            .self::pngChunk('IEND', '');
    }

    /** One length-prefixed, CRC32-suffixed PNG chunk. */
    private static function pngChunk(string $type, string $data): string
    {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    }
}
