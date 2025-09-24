/// <reference types="jquery" />

declare global {
  interface Window {
    $: JQueryStatic;
    jQuery: JQueryStatic;
    tinymce: any;
  }
}

export {};