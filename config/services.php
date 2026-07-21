<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Facebook App ID for the public share cards' fb:app_id meta tag. Get one at
    // developers.facebook.com; leave unset to omit the (non-blocking) tag.
    'facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
    ],

    // Shared secret for the external cron endpoint that runs the Laravel
    // scheduler (GET /cron/{token}). Leave unset to disable the endpoint.
    'cron' => [
        'secret' => env('CRON_SECRET'),
    ],

    // Incoming webhook URL for the "trainee hours met" Google Chat alert
    // (HourThresholdDispatcher). Leave unset to skip the Chat leg — email +
    // in-app notification still fire.
    'google_chat' => [
        'webhook_url' => env('GOOGLE_CHAT_WEBHOOK_URL'),
    ],

];
