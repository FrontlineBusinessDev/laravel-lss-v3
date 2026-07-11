<?php

namespace App\Support;

/**
 * Branded 1200x630 Open Graph share card: system logo + name + description +
 * batch details on the left, a framed, scannable QR on the right. 1200x630 is
 * the 1.91:1 ratio Facebook/Messenger/Twitter expect, so the card is shown whole
 * instead of cropping a bare square QR top/bottom.
 *
 * Requires gd (with FreeType). The public og:image route wraps render() in a
 * try/catch and falls back to QrCode::paddedOg() — a gd-free, non-clipped 1200x630
 * QR — so a runtime without gd degrades to a plain card rather than a 500.
 */
class OgImage
{
    private const WIDTH = 1200;

    private const HEIGHT = 630;

    /** Left text column bounds. */
    private const PAD_X = 72;

    private const TEXT_MAX_WIDTH = 620;

    /** QR panel (right column). */
    private const PANEL_X = 748;

    private const PANEL_Y = 132;

    private const PANEL_SIZE = 366;

    private const PANEL_PAD = 26;

    /**
     * @param  string  $registerUrl  the link the QR encodes (the guest register page)
     * @param  string  $systemName  the app/brand name shown as the heading
     * @param  string  $description  the share blurb, wrapped to the text column
     * @param  string  $details  a single line of batch specifics (program · setup · code)
     * @return string raw PNG bytes
     */
    public static function render(string $registerUrl, string $systemName, string $description, string $details): string
    {
        if (! function_exists('imagecreatetruecolor') || ! function_exists('imagettftext')) {
            throw new \RuntimeException('gd with FreeType is required to render the branded og:image.');
        }

        $img = imagecreatetruecolor(self::WIDTH, self::HEIGHT);

        $white = self::color($img, 255, 255, 255);
        $ink = self::color($img, 15, 23, 42);      // slate-900
        $muted = self::color($img, 100, 116, 139); // slate-500
        $brand = self::color($img, 178, 30, 115);  // logo magenta
        $line = self::color($img, 226, 232, 240);  // slate-200

        imagefilledrectangle($img, 0, 0, self::WIDTH, self::HEIGHT, $white);
        imagefilledrectangle($img, 0, 0, self::WIDTH, 10, $brand); // top brand band

        $font = resource_path('fonts/OpenSans-Regular.ttf');

        self::drawLogo($img, public_path('fbs_logo.png'), self::PAD_X, 54, 118);

        // Heading + copy, stacked below the logo.
        imagettftext($img, 40, 0, self::PAD_X, 250, $ink, $font, $systemName);

        $y = self::paragraph($img, $font, 21, $muted, self::PAD_X, 306, $description, self::TEXT_MAX_WIDTH, 1.55);
        self::paragraph($img, $font, 20, $brand, self::PAD_X, $y + 22, $details, self::TEXT_MAX_WIDTH, 1.55);

        imagettftext($img, 18, 0, self::PAD_X, 560, $muted, $font, 'Scan the code to register online');

        self::drawQrPanel($img, $registerUrl, $ink, $white, $line, $brand, $font);

        ob_start();
        imagepng($img);
        $png = ob_get_clean();
        imagedestroy($img);

        if ($png === '') {
            throw new \RuntimeException('Failed to encode the og:image PNG.');
        }

        return $png;
    }

    /**
     * Allocate an RGB color, falling back to black if allocation fails.
     *
     * @param  int<0, 255>  $r
     * @param  int<0, 255>  $g
     * @param  int<0, 255>  $b
     */
    private static function color(\GdImage $img, int $r, int $g, int $b): int
    {
        $color = imagecolorallocate($img, $r, $g, $b);

        return $color === false ? 0 : $color;
    }

    /** Composite the (alpha) logo onto the canvas, scaled to $targetH keeping ratio. */
    private static function drawLogo(\GdImage $img, string $path, int $x, int $y, int $targetH): void
    {
        if (! is_file($path)) {
            return;
        }

        $logo = @imagecreatefrompng($path);
        if ($logo === false) {
            return;
        }

        $lw = imagesx($logo);
        $lh = imagesy($logo);
        $w = (int) round($lw * ($targetH / $lh));

        imagealphablending($img, true);
        imagecopyresampled($img, $logo, $x, $y, 0, 0, $w, $targetH, $lw, $lh);
        imagedestroy($logo);
    }

    /** White framed panel with the QR (reuses the extension-free QrCode::png). */
    private static function drawQrPanel(\GdImage $img, string $url, int $ink, int $white, int $line, int $brand, string $font): void
    {
        $x0 = self::PANEL_X;
        $y0 = self::PANEL_Y;
        $x1 = $x0 + self::PANEL_SIZE;
        $y1 = $y0 + self::PANEL_SIZE;

        imagefilledrectangle($img, $x0, $y0, $x1, $y1, $white);
        imagerectangle($img, $x0, $y0, $x1, $y1, $line);

        $inner = self::PANEL_SIZE - 2 * self::PANEL_PAD;
        $qr = @imagecreatefromstring(QrCode::png($url, $inner));
        if ($qr !== false) {
            imagecopyresampled(
                $img, $qr,
                $x0 + self::PANEL_PAD, $y0 + self::PANEL_PAD, 0, 0,
                $inner, $inner, imagesx($qr), imagesy($qr),
            );
            imagedestroy($qr);
        }

        self::centered($img, $font, 19, $brand, 'Scan to register', $x0, $x1, $y1 + 40);
    }

    /** Draw wrapped text from baseline $y; return the baseline for the next block. */
    private static function paragraph(\GdImage $img, string $font, float $size, int $color, int $x, int $y, string $text, int $maxWidth, float $lineHeight): int
    {
        foreach (self::wrap($font, $size, $maxWidth, $text) as $text_line) {
            imagettftext($img, $size, 0, $x, $y, $color, $font, $text_line);
            $y += (int) round($size * $lineHeight);
        }

        return $y;
    }

    /**
     * Greedy word-wrap to $maxWidth px using FreeType metrics.
     *
     * @return list<string>
     */
    private static function wrap(string $font, float $size, int $maxWidth, string $text): array
    {
        $lines = [];
        $current = '';

        foreach (preg_split('/\s+/', trim($text)) ?: [] as $word) {
            $candidate = $current === '' ? $word : $current.' '.$word;
            $box = imagettfbbox($size, 0, $font, $candidate);
            $width = $box === false ? 0 : $box[2] - $box[0];

            if ($width > $maxWidth && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $candidate;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }

    /** Draw text horizontally centered between $x0 and $x1 at baseline $y. */
    private static function centered(\GdImage $img, string $font, float $size, int $color, string $text, int $x0, int $x1, int $y): void
    {
        $box = imagettfbbox($size, 0, $font, $text);
        $width = $box === false ? 0 : $box[2] - $box[0];
        $x = $x0 + (int) round((($x1 - $x0) - $width) / 2);

        imagettftext($img, $size, 0, $x, $y, $color, $font, $text);
    }
}
