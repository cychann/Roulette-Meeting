var cnt = 1;
    
    function imgToggle() {
        var img1 = document.getElementById("img1");
        

        if(cnt%2==1){
            img1.src="mute.png";
            
        }
        else{
            img1.src="mute_red.png";
            
        }
        cnt++;
    }





    function imgToggle_video() {
        var img1 = document.getElementById("img2");
        

        if(cnt%2==1){
            img1.src="start_video.png";
            
        }
        else{
            img1.src="stop_video.png";
            
        }
        cnt++;

    }

    function imgToggle_video() {
        var img1 = document.getElementById("img2");
        

        if(cnt%2==1){
            img1.src="start_video.png";
            
        }
        else{
            img1.src="stop_video.png";
            
        }
        cnt++;

    }
