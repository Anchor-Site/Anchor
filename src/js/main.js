// // import Vue from "vue";
// // import App from './vue/App.vue';

import Anchor from './anchor';
import Dexie from 'dexie';

// async function main() {
//     let url = new URL(window.location.href);
//     let edit = url.searchParams.get('edit');
//     if (edit == "true") {
//         let anchor = (await import('./anchor')).default;
//         anchor(document.getElementById('content'));
//     }

//     // document.getElementById('anchor-button').addEventListener('click', async () => {
//     //     let anchor = (await import('./anchor')).default;
//     //     anchor(document.getElementById('content'));
//     // });
// }

// main();

// Dexie.delete('AnchorDB');

let anchor = Anchor();
console.log(anchor);
anchor.setup();

// let db = new Dexie('AnchorDB');
// db.delete();