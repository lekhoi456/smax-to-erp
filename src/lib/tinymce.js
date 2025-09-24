import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.min.css';

// Import plugins
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/code';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';

/**
 * Initialize TinyMCE editor
 */
export function initTinyMCE() {
  tinymce.init({
    selector: '#erpNote',
    height: 200,
    menubar: false,
    plugins: [
      'link lists table code emoticons'
    ],
    toolbar: 'undo redo | formatselect | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | emoticons',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; }',
    skin: 'oxide',
    content_css: 'default',
    branding: false,
    promotion: false,
    setup: function(editor) {
      editor.on('change', function() {
        editor.save();
      });
    }
  });
} 