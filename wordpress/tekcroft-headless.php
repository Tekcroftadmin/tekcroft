<?php
/**
 * Plugin Name: Tekcroft Headless Bridge
 * Description: Exposes Rank Math SEO fields on the REST API and pings the Tekcroft Next.js revalidate webhook on publish/update/delete.
 * Author: Tekcroft
 * Version: 1.0.0
 *
 * Install (Hostinger):
 * 1. Upload this file to wp-content/mu-plugins/tekcroft-headless.php
 *    (create the mu-plugins folder if it does not exist)
 * 2. In wp-config.php (above "That's all, stop editing!"), add:
 *      define('TEKCROFT_REVALIDATE_URL', 'https://tekcroft.com/api/revalidate');
 *      define('TEKCROFT_REVALIDATE_SECRET', 'same-value-as-REVALIDATION_SECRET-in-Next');
 * 3. Settings → Reading → discourage search engines (staging only).
 * 4. Rank Math → make sure posts have SEO titles/descriptions.
 */

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Expose Rank Math meta on post REST responses as `rank_math`.
 */
add_action('rest_api_init', function () {
  register_rest_field('post', 'rank_math', [
    'get_callback' => function ($post_arr) {
      $id = isset($post_arr['id']) ? (int) $post_arr['id'] : 0;
      if (!$id) {
        return null;
      }

      $robots = get_post_meta($id, 'rank_math_robots', true);
      if (!is_array($robots)) {
        $robots = $robots ? [$robots] : [];
      }

      $og_image = get_post_meta($id, 'rank_math_facebook_image', true);
      if (!$og_image) {
        $thumb = get_the_post_thumbnail_url($id, 'full');
        $og_image = $thumb ? $thumb : '';
      }

      $twitter_image = get_post_meta($id, 'rank_math_twitter_image', true);
      if (!$twitter_image) {
        $twitter_image = $og_image;
      }

      return [
        'title' => (string) get_post_meta($id, 'rank_math_title', true),
        'description' => (string) get_post_meta($id, 'rank_math_description', true),
        'focus_keyword' => (string) get_post_meta($id, 'rank_math_focus_keyword', true),
        'canonical_url' => (string) get_post_meta($id, 'rank_math_canonical_url', true),
        'robots' => $robots,
        'og_title' => (string) get_post_meta($id, 'rank_math_facebook_title', true),
        'og_description' => (string) get_post_meta($id, 'rank_math_facebook_description', true),
        'og_image' => (string) $og_image,
        'twitter_title' => (string) get_post_meta($id, 'rank_math_twitter_title', true),
        'twitter_description' => (string) get_post_meta($id, 'rank_math_twitter_description', true),
        'twitter_image' => (string) $twitter_image,
      ];
    },
    'schema' => [
      'description' => 'Rank Math SEO fields for headless Tekcroft.',
      'type' => 'object',
    ],
  ]);
});

/**
 * Ping Tekcroft Next.js when a post changes.
 */
function tekcroft_headless_ping($post_id, $post = null, $event = 'post.save') {
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
    return;
  }
  if (wp_is_post_revision($post_id)) {
    return;
  }

  $url = defined('TEKCROFT_REVALIDATE_URL') ? TEKCROFT_REVALIDATE_URL : '';
  $secret = defined('TEKCROFT_REVALIDATE_SECRET') ? TEKCROFT_REVALIDATE_SECRET : '';
  if (!$url || !$secret) {
    return;
  }

  $post = $post instanceof WP_Post ? $post : get_post($post_id);
  if (!$post || $post->post_type !== 'post') {
    return;
  }

  $payload = [
    'secret' => $secret,
    'event' => $event,
    'id' => (int) $post_id,
    'slug' => $post->post_name,
    'status' => $post->post_status,
  ];

  wp_remote_post($url, [
    'timeout' => 8,
    'blocking' => false,
    'headers' => [
      'Content-Type' => 'application/json',
      'x-tekcroft-revalidate-secret' => $secret,
    ],
    'body' => wp_json_encode($payload),
  ]);
}

add_action('save_post_post', function ($post_id, $post, $update) {
  if (!$post instanceof WP_Post) {
    return;
  }
  if (!in_array($post->post_status, ['publish', 'draft', 'private', 'trash', 'pending'], true)) {
    return;
  }
  $event = $post->post_status === 'publish' ? 'post.save' : 'post.unpublish';
  tekcroft_headless_ping($post_id, $post, $event);
}, 20, 3);

add_action('before_delete_post', function ($post_id) {
  $post = get_post($post_id);
  if ($post && $post->post_type === 'post') {
    tekcroft_headless_ping($post_id, $post, 'post.delete');
  }
});

add_action('transition_post_status', function ($new, $old, $post) {
  if (!$post instanceof WP_Post || $post->post_type !== 'post') {
    return;
  }
  if ($old === 'publish' && $new !== 'publish') {
    tekcroft_headless_ping($post->ID, $post, 'post.unpublish');
  }
}, 10, 3);

/**
 * Discourage indexing of the WordPress staging domain itself.
 * Production indexing happens on tekcroft.com via Next.js.
 */
add_action('wp_head', function () {
  if (is_admin()) {
    return;
  }
  echo "<meta name=\"robots\" content=\"noindex, nofollow\" />\n";
}, 1);
