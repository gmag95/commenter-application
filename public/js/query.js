let post_n = document.querySelectorAll(".post").length;

if (post_n && comm_length>5 && document.querySelector("#reload-btn")) {
    document.querySelector("#reload-btn").addEventListener("click", () => {
        getData();
    })
}

function getData() {
    var request = new XMLHttpRequest();
    request.open('POST', 'http://127.0.0.1:3000/comments/getData', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function() {
        let data = eval(this.response);
        for (let el of data) {
            let new_post = document.createElement("div")
            new_post.classList.add("post", "mb-2", "p-1", "row", "w-100");
            let first_row = document.createElement("div");
            first_row.classList.add("flex-wrap");
            let bold = document.createElement("b");
            let user = document.createElement("a");
            user.href=`http://localhost:3000/comments/history?user=${el.user}&startDate=&endDate=`;
            user.innerHTML=el.user;
            bold.appendChild(user);
            first_row.appendChild(bold);
            first_row.innerHTML += " on ";
            bold = document.createElement("b");
            bold.innerHTML = el.timestamp.substring(0, 10);
            first_row.appendChild(bold);
            if (currUsername && el.user == currUsername) {
                let newSpan = document.createElement("span");
                let firstForm = document.createElement("form");
                firstForm.action = `/comments/${el._id}/edit`;
                let edit_button = document.createElement("button");
                edit_button.classList.add("btn", "text-black", "btn-sm");
                edit_button.innerHTML="Edit";
                let firstUrl = document.createElement("input");
                firstUrl.name="url";
                firstUrl.type="hidden";
                firstUrl.value=currPage.substring(21);
                let firstNum=document.createElement("input");
                firstNum.name="num";
                firstNum.type="hidden";
                firstNum.classList.add("num");
                firstForm.appendChild(edit_button);
                firstForm.appendChild(firstUrl);
                firstForm.appendChild(firstNum);
                newSpan.appendChild(firstForm);
                let secondForm = document.createElement("form");
                secondForm.action = `/comments/${el._id}?_method=DELETE`;
                secondForm.method = "POST";
                let delete_button = document.createElement("button");
                delete_button.classList.add("btn", "text-black", "btn-sm");
                delete_button.innerHTML="Delete";
                let secondUrl = document.createElement("input");
                secondUrl.name="url";
                secondUrl.type="hidden";
                secondUrl.value=currPage.substring(21);
                let secondNum=document.createElement("input");
                secondNum.name="num";
                secondNum.type="hidden";
                secondNum.classList.add("num");
                secondForm.appendChild(delete_button);
                secondForm.appendChild(secondUrl);
                secondForm.appendChild(secondNum);
                newSpan.appendChild(secondForm);
                first_row.appendChild(newSpan);
            }
            new_post.appendChild(first_row);
            let second_row = document.createElement("div");
            second_row.innerHTML = el.comment.slice(0,240);
            new_post.appendChild(second_row);
            document.querySelector(".post-container").insertBefore(new_post, document.querySelector("#reload-btn"));
        }
        if (post_n+5>=comm_length) {
            document.getElementById("reload-btn").remove();
            let end_message = document.createElement("p");
            end_message.innerHTML="There are no more comments";
            end_message.classList.add("bottom-el");
            document.querySelector(".post-container").appendChild(end_message);
        }
        post_n = document.querySelectorAll(".post").length;

        for (let el of document.querySelectorAll(".num")) {
            el.value=post_n;
        }
      };

    request.send(JSON.stringify({post_n, conditions}));
}