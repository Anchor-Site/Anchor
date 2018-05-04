import Dexie from 'dexie';

function toSlug(text) {
    return text.toString().toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/[^\w\-]+/g, '')
               .replace(/\-\-+/g, '-')
               .replace(/^-+/, '')
               .replace(/-+$/, '');
}

function checkDate(post) {
    let today = new Date();
    let dateString = `${today.getMonth() < 9 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1}/${today.getDate() < 10 ? '0' + today.getDate() : today.getDate()}/${today.getFullYear()}`;
    let postDate = post.getElementsByClassName('post-date')[0];
    if (postDate.textContent != dateString) postDate.textContent = dateString;
}

function getRange() {
    let sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        let range = sel.getRangeAt(0);
        return range;
    }
}

function fixSlug(post) {
    let title = post.getElementsByClassName('post-title')[0];
    let link = document.querySelector(`a[href='#${post.id}']`);
    if (link.href != toSlug(title.textContent)) {
        let slug = toSlug(title.textContent);
        post.id = slug;
        link.href = "#" + slug;
        link.textContent = title.textContent;
    }
}

function addHandlers(post, anchor) {
    console.log('ttf');
    let content = post.getElementsByClassName('post-content')[0];
    content.addEventListener('click', (event) => {
        if (anchor.enabled) {
            content.contentEditable = true;
        }
    });
    content.addEventListener('keyup', (event) => {
        if (anchor.enabled) {
            checkDate(post);
        }
    });
    content.addEventListener('contextmenu', (event) => {
        if (anchor.enabled) {
            event.preventDefault();
        }
    });
    content.addEventListener('mouseup', (event) => {
        if (anchor.enabled) {
            let code = event.button;

            if (code == 2) {
                event.preventDefault();
                let input = document.createElement('input');
                input.type = 'file';
                input.click();

                input.addEventListener('change', (event) => {
                    let file = input.files[0];
                    let reader = new FileReader();
                    let img = document.createElement('img');
                    reader.onload = () => {
                        console.log(reader.result);
                        img.src = reader.result;
                        img.style.width = '400px';

                        let sel = getRange();
                        let frag = document.createDocumentFragment();
                        frag.appendChild(img);
                        sel.insertNode(frag);
                    }
                    reader.readAsDataURL(file);
                    // let img = document.createElement('img');
                    // img.src = file;


                });
            }
        }
    });
    
    let title = post.getElementsByClassName('post-title')[0];
    title.addEventListener('click', (event) => {
        if (anchor.enabled) {
            title.contentEditable = true;
        }
    });
    title.addEventListener('keyup', (event) => {
        if (anchor.enabled) {
            checkDate(post);
            fixSlug(post);
        }
    });
}

export default function Anchor() {
    let anchor = {
        db: null,
        enabled: false,
        controls: [],
        posts: [],
        setup: () => {
            document.addEventListener("keydown", (event) => {
                if (event.altKey && event.key.toLowerCase() === 'e') {
                    if (anchor.enabled) anchor.disable();
                    else anchor.enable();
                    event.preventDefault();
                }
            });
            document.addEventListener("keydown", anchor.command_event);

            anchor.db = new Dexie('AnchorDB');

            anchor.db.version(1).stores({
                pages: 'name,html'
            });

            anchor.controls = [];

            anchor.controls.push(document.getElementById('anchor-add-post'));
            anchor.controls.push(document.getElementById('anchor-publish'));
            anchor.controls.push(document.getElementById('anchor-discard'));

            document.getElementById('anchor-add-post').addEventListener('click', anchor.add_post);
            document.getElementById('anchor-publish').addEventListener('click', anchor.publish);
            document.getElementById('anchor-discard').addEventListener('click', anchor.discard);

            anchor.posts = Array.prototype.slice.call(document.getElementsByTagName('article'));
            anchor.posts.forEach(post => addHandlers(post, anchor));
        },
        save: async () => {
            await anchor.db.pages.put({
                name: window.location.pathname,
                html: document.body.innerHTML
            });
        },
        load: async () => {
            let page = await anchor.db.pages.get(window.location.pathname);
            if (page !== undefined) {
                document.body.innerHTML = page.html;
            }
            anchor.setup();
        },
        enable: () => {
            anchor.load();
            anchor.controls.forEach(control => control.classList.remove('hidden'));
            anchor.enabled = true;
        },
        disable: () => {
            anchor.save();
            anchor.controls.forEach(control => control.classList.add('hidden'));
            let editables = Array.prototype.slice.call(document.querySelectorAll(`[contentEditable='true']`));
            editables.forEach(editable => editable.contentEditable = false);
            anchor.enabled = false;
            window.location.reload();
        },
        add_post: () => {
            let template = document.getElementById('post-template');
            let postContainer = document.getElementById('article-container');
            postContainer.insertAdjacentElement('afterbegin', template.cloneNode(true));

            let post = postContainer.firstElementChild;

            let name = post.getElementsByClassName('post-title')[0].textContent;

            anchor.posts.push(post);
            addHandlers(post, anchor);

            let slug = toSlug(name);
            post.classList.remove('hidden');
            post.id = slug;

            post.getElementsByClassName('post-title')[0].textContent = name;

            let today = new Date();
            let dateString = `${today.getMonth() < 9 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1}/${today.getDate() < 10 ? '0' + today.getDate() : today.getDate()}/${today.getFullYear()}`
            post.getElementsByClassName('post-date')[0].textContent = dateString;

            let postList = document.getElementById('post-list');
            let postLinkItem = document.createElement('li');
            let postLink = document.createElement('a');
            postLink.href = '#' + slug;
            postLink.textContent = name;
            postLinkItem.appendChild(postLink);
            postList.insertAdjacentElement('afterbegin', postLinkItem);
        },
        publish: () => {

        },
        discard: async () => {
            await anchor.db.pages.delete(window.location.pathname);
            window.location.reload();
        },
        command_event: (event) => {
            if (event.ctrlKey) {
                let selection = window.getSelection();
                let element = selection.focusNode.parentElement;
                while (element.tagName.toLowerCase() != 'article' && element !== null) {
                    element = element.parentElement;
                }
                if (element !== null) {
                    element.contentEditable = true;
                    let char = event.key.toLowerCase();
                    if (char == 'b') {
                        document.execCommand('bold');
                        event.preventDefault();
                    }
                    else if (char == 'u') {
                        document.execCommand('underline');
                        event.preventDefault();
                    }
                    else if (char == 'i') {
                        document.execCommand('italic');
                        event.preventDefault();
                    }
                    element.contentEditable = false;
                }
            }
        }
    };

    return anchor;
}

// import Vue from "vue";
// import App from './vue/App.vue';



// export default function anchor(contentElement) {
//     new Vue({
//         el: '#root',
//         render: h => h(App)
//     });

//     contentElement.contentEditable = true;

//     contentElement.addEventListener('mouseup', (event) => {
//         let code = event.button;

//         if (code == 2) {
//             event.preventDefault();
//             let input = document.createElement('input');
//             input.type = 'file';
//             input.click();

//             input.addEventListener('change', (event) => {
//                 let file = input.files[0];
//                 let reader = new FileReader();
//                 let img = document.createElement('img');
//                 reader.onload = () => {
//                     img.src = reader.result;
//                 }
//                 reader.readAsDataURL(file);
//                 // let img = document.createElement('img');
//                 // img.src = file;
    
//                 let sel = getRange();
//                 let frag = document.createDocumentFragment();
//                 frag.appendChild(img);
//                 sel.insertNode(frag);
//             });
//         }
//     });

//     contentElement.addEventListener('keydown', (event) => {
//         if (event.ctrlKey) {
//             let char = event.key.toLowerCase();
//             if (char == 'b') {
//                 event.preventDefault();
//                 document.execCommand('bold');
//             }
//             else if (char == 'u') {
//                 event.preventDefault();
//                 document.execCommand('underline');

//             }
//             else if (char == 'i') {
//                 event.preventDefault();
//                 document.execCommand('italic');
//             }
//         }
//     });

//     contentElement.addEventListener('contextmenu', (evenr) => {
//         event.preventDefault();
//     });
// }