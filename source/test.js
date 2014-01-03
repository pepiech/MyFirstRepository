var i = localStorage.length;
function onBodyLoad(){
    var todo = "";
     
    create_new_list();
     
    $("#clear").click(function(){
        localStorage.clear();
        $("#todo_list li").fadeOut(function(){
            $(this).html("");
        });
    });
 
    $("#remove").live("click",function(e){
        var index = $(this).closest("li").attr("id");
        $(this).closest("li").slideUp(function(){
         
            // remove the selected item
            localStorage.removeItem('names_'+index);
             
            // rearrange localstorage array
            for(i=0; i < localStorage.length; i++) {
              if( !localStorage.getItem("names_"+i)) {
                localStorage.setItem("names_"+i, localStorage.getItem('names_' + (i+1) ) );
                localStorage.removeItem('names_'+ (i+1) );
              }
            }
             
            // clear existing list UI
            $("#todo_list").html("");
             
            // create new list
            create_new_list();
        });
    });
}
function create_new_list(){
    for (var i = 0; i < localStorage.length; i++){
        todo = localStorage.getItem('names_'+i);
        $("#todo_list").append('<li id="'+i+'"><a href="#">'+todo+'</a><a href="#" data-rel="dialog" data-transition="slideup" id="remove">Remove</a></li>');
    }  
    // Refresh list so jquery mobile can apply iphone look to the list
    $("#todo_list").listview();
    $("#todo_list").listview("refresh");   
}
function save_todo(){
    var todo = $("#textinput1").val();
    if(todo.length){
        // store item in local storage
        localStorage['names_'+i] = todo;
 
        // Update todo list
        $("#todo_list").append('<li id="'+i+'"><a href="#">'+todo+'</a><a href="#" data-rel="dialog" data-transition="slideup" id="remove">Remove</a></li>');
         
        // Refresh list so jquery mobile can apply iphone look to the list
        $("#todo_list").listview();
        $("#todo_list").listview("refresh");   
        i++;
    }
}