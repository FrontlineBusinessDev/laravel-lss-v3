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
 * route). Deliberately extension-free — neither svg() nor png() needs gd or
 * imagick, so the public og:image endpoint can't 500 on a lean runtime:
 *
 *   - svg(): inline SVG via BaconQrCode. The XML prolog is stripped so the
 *     markup embeds cleanly via innerHTML or an image/svg+xml response.
 *   - png(): raster PNG hand-encoded from the QR module matrix (only zlib,
 *     which is always present). Social scrapers such as Facebook ignore SVG
 *     og:images, so the shared preview must be a PNG.
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
     * Raw PNG bytes of the QR, used as the public register page's og:image.
     * The QR is a black/white module matrix, so we scale it to ~$targetSize px
     * and encode a grayscale PNG directly — no image extension required.
     */
    public static function png(string $text, int $targetSize = 512, int $marginModules = 4): string
    {
        $matrix = (new MatrixFactory)->create(new EndroidQrCode($text));
        $count = $matrix->getBlockCount();
        $scale = max(1, intdiv($targetSize, $count + 2 * $marginModules));
        $dim = ($count + 2 * $marginModules) * $scale;

        // 8-bit grayscale scanlines: each row prefixed with a "none" filter byte,
        // dark modules 0x00, light 0xFF. Built at module resolution then scaled.
        $light = "\xFF";
        $dark = "\x00";
        $marginPixels = str_repeat($light, $marginModules * $scale);
        $lightScanline = "\x00".str_repeat($light, $dim);
        $marginBlock = str_repeat($lightScanline, $marginModules * $scale);

        $body = '';
        for ($row = 0; $row < $count; $row++) {
            $pixels = $marginPixels;
            for ($col = 0; $col < $count; $col++) {
                $on = $matrix->getBlockValue($row, $col) === 1;
                $pixels .= str_repeat($on ? $dark : $light, $scale);
            }
            $body .= str_repeat("\x00".$pixels.$marginPixels, $scale);
        }

        return self::encodePng($dim, $dim, $marginBlock.$body.$marginBlock);
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
