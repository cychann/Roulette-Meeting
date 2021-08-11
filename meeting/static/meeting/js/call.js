var cnt = 1;
    
    function imgToggle() {
        var img1 = document.getElementById("img1");
        

        if(cnt%2==1){
            img1.src="templates\static\mute.png";
            
        }
        else{
            img1.src="templates\static\mute_red.png";
            
        }
        cnt++;
    }





    function imgToggle_video() {
        var img1 = document.getElementById("img2");
        

        if(cnt%2==1){
            img1.src="templates\static\start_video.png";
            
        }
        else{
            img1.src="templates\static\stop_video.png";
            
        }
        cnt++;

    }

