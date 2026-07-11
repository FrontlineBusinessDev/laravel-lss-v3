<?php

namespace App\Support;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

/**
 * First-party QR generation. Renders text as an inline SVG using the pure-PHP
 * BaconQrCode backend (no gd/imagick extension required). The XML prolog is
 * stripped so the markup embeds cleanly wherever it is used — innerHTML on the
 * client, or a raw image/svg+xml HTTP response.
 *
 * Single source of truth for QR rendering (used by the authenticated
 * batch-registration endpoint and the public og:image route).
 */
class QrCode
{
    public static function svg(string $text, int $size = 220): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size, 1),
            new SvgImageBackEnd(),
        );
        $svg = (new Writer($renderer))->writeString($text);
        $start = strpos($svg, '<svg');

        return $start !== false ? substr($svg, $start) : $svg;
    }
}
