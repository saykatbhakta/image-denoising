let questions = document.querySelectorAll(".question");
// let answers = document.querySelectorAll(".answer");

for(let question of questions){
    question.addEventListener('click',function(){
        var answer= this.nextElementSibling;
        answer.classList.toggle('display_ans');
        var child = this.children[1];
        child.classList.toggle('rotate');
    });
}