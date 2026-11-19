<?php
/**
 * Plugin Name: Tekcroft Gutenberg Editor Preview
 * Description: Applies Tekcroft single-post content styles inside the WordPress block editor only. Does not affect the live Next.js site or the headless bridge.
 * Author: Tekcroft
 * Version: 1.0.0
 *
 * Install (Hostinger):
 * 1. Upload this file AND tekcroft-editor-styles.css to:
 *      wp-content/mu-plugins/
 *    (both files must sit in the same mu-plugins folder)
 * 2. Hard-refresh the post editor (Ctrl/Cmd+Shift+R).
 * 3. Do not place this CSS in the active theme unless you intentionally want theme coupling.
 */

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Absolute filesystem path to the editor CSS (same directory as this MU plugin).
 */
function tekcroft_editor_styles_path() {
  return __DIR__ . '/tekcroft-editor-styles.css';
}

/**
 * Public URL to the editor CSS.
 */
function tekcroft_editor_styles_url() {
  // MU plugins live in wp-content/mu-plugins/
  return content_url('mu-plugins/tekcroft-editor-styles.css');
}

/**
 * Enable editor styles so WordPress injects them into the block canvas iframe.
 */
add_action('after_setup_theme', function () {
  add_theme_support('editor-styles');
}, 20);

/**
 * Register stylesheet for the classic editor_stylesheets pipeline (iframe canvas).
 */
add_filter('editor_stylesheets', function ($stylesheets) {
  if (!is_array($stylesheets)) {
    $stylesheets = [];
  }

  $path = tekcroft_editor_styles_path();
  if (is_readable($path)) {
    $stylesheets[] = tekcroft_editor_styles_url() . '?ver=' . (string) filemtime($path);
  }

  return $stylesheets;
});

/**
 * Also inject CSS via block editor settings (covers WP versions / themes
 * that skip editor_stylesheets for headless setups).
 */
add_filter('block_editor_settings_all', function ($settings, $context = null) {
  $path = tekcroft_editor_styles_path();
  if (!is_readable($path)) {
    return $settings;
  }

  $css = file_get_contents($path);
  if ($css === false || $css === '') {
    return $settings;
  }

  if (!isset($settings['styles']) || !is_array($settings['styles'])) {
    $settings['styles'] = [];
  }

  $settings['styles'][] = [
    'css' => $css,
    '__unstableType' => 'theme',
  ];

  // Align default content width with Tekcroft article column.
  if (!isset($settings['__experimentalFeatures']) || !is_array($settings['__experimentalFeatures'])) {
    $settings['__experimentalFeatures'] = [];
  }
  if (!isset($settings['__experimentalFeatures']['layout']) || !is_array($settings['__experimentalFeatures']['layout'])) {
    $settings['__experimentalFeatures']['layout'] = [];
  }
  $settings['__experimentalFeatures']['layout']['contentSize'] = '840px';
  $settings['__experimentalFeatures']['layout']['wideSize'] = '840px';

  return $settings;
}, 10, 2);

/**
 * Load Inter + Sora in the editor chrome (canvas also gets them via @import in CSS).
 */
add_action('enqueue_block_editor_assets', function () {
  wp_enqueue_style(
    'tekcroft-editor-fonts',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap',
    [],
    null
  );

  $path = tekcroft_editor_styles_path();
  if (is_readable($path)) {
    // Extra pass for non-iframe admin surfaces; canvas still uses injected styles above.
    wp_enqueue_style(
      'tekcroft-editor-preview',
      tekcroft_editor_styles_url(),
      ['tekcroft-editor-fonts'],
      (string) filemtime($path)
    );
  }
});
