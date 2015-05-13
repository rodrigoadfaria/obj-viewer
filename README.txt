  __  __            _____  ___   _  _  ___    ___           _____  ______  _  _    _  _                    
 |  \/  |    /\    / ____|/ _ \ | || ||__ \  / _ \         | ____||____  || || |  | || |                   
 | \  / |   /  \  | |    | | | || || |_  ) || | | | ______ | |__      / / | || |_ | || |_                  
 | |\/| |  / /\ \ | |    | | | ||__   _|/ / | | | ||______||___ \    / /  |__   _||__   _|                 
 | |  | | / ____ \| |____| |_| |   | | / /_ | |_| |         ___) |  / /      | |     | |                   
 |_|  |_|/_/    \_\\_____|\___/    |_||____| \___/         |____/  /_/       |_|     |_|                   
   _____                                 _                   _____                     _      _            
  / ____|                               | |                 / ____|                   | |    (_)           
 | |      ___   _ __ ___   _ __   _   _ | |_  ___  _ __    | |  __  _ __  __ _  _ __  | |__   _   ___  ___ 
 | |     / _ \ | '_ ` _ \ | '_ \ | | | || __|/ _ \| '__|   | | |_ || '__|/ _` || '_ \ | '_ \ | | / __|/ __|
 | |____| (_) || | | | | || |_) || |_| || |_|  __/| |      | |__| || |  | (_| || |_) || | | || || (__ \__ \
  \_____|\___/ |_| |_| |_|| .__/  \__,_| \__|\___||_|       \_____||_|   \__,_|| .__/ |_| |_||_| \___||___/
                          | |                                                  | |                         
                          |_|                                                  |_|                         


README
------
  OBJ viewer is a web tool capable of load and render a 3D object defined by a modelling tool such as
  Blender, Maya, and others. Find out how to use this tool in the man section of this file.

CONFIG
------
  You do not need any previous configuration to run the application, just use a web browser that supports
  HTML5 canvas and WebGL technology.
  The only thing you need is to look for .obj files or create them using a modelling tool like those
  mentioned in the previous section. In the 'sample_obj' directory, you can find a sample .obj file.

MAN
---
  Just open the 'objViewer.html' page in your preferred web browser and enjoy it! We have detailed aspects
  regarding the features above:
  
  [Load OBJ file...] read a .obj file with the description of faces, vertices, normals and object name.
  Some commands such as 'mtllib', 'usemtl', are not being read.
  When you load an object, you can see it is description on the left side menu.
  
  [Shader Vertex/Fragment] toggle between two different shaders. This option stop the current vertex/fragment shaders
  and load a new one with different shading algorithm.
  
  [Mesh Flat/Smooth] toggle the method of shading from flat to smooth and vice versa.
  
  [Draw Triangles/Lines] toggle the method of drawing from triangles to line strip and vice versa.
  
  [Rotation] rotate the scene by holding the left click and dragging to any direction.
  
  [Zoom in/out] zoom in/out the scene by rolling the mouse wheel or by holding the right click and 
  dragging to any direction.
  
  [Manipulator] you can manipulate an object by selecting it in the left menu. Once you select it, point the mouse
  in the canvas area and press 'R' or 'r' to rotate, 'T' or 't' to translate and 'S' or 's' to scale. You might press 
  'X' or 'x', 'Y' or 'y' or 'Z' or 'z' to choose an axis to apply the transformation on a given axis.
  You can delete an object pressing 'X', 'x' or 'DEL'. It is important to remember that this feature only works if 
  you haven't pressed any keyword for transformations.
  You can deselect the object pressing 'ESC'.

CONTACT
-------
  If you have problems, questions, ideas or suggestions, please contact us by sending a detailed
  mail to caio.dadauto@usp.br, rofaria@ime.usp.br or {caiodadauto, rodrigoadfaria}@gmail.com.

STRUCTURE
---------
│   obj-reader.js
│   obj-viewer.html
│   obj-viewer.js
│   README.txt
│
├───documents
│       EP2.pdf
│
├───js
│       Manipulator.js
│       Quaternion.js
│       Scene.js
│       VirtualTrackBall.js
│
├───libs
│       initShaders.js
│       jquery-2.1.3.min.js
│       MV.js
│       webgl-utils.js
│
├───sample_obj
│       teapot.obj
│
└───style
    │   style.css
    │
    └───img
            collapsed.png
            expanded.png
            loading.gif
            logo.png
            separator.svg
	  
NOTICE
------
  We have tested only in Microsoft Internet Explorer v11.0.9600 and Google Chrome v41.0.2272.118.
  If you have a web browser that supports the HTML5 canvas and WebGL technology, you will get it working.
  
  You can see detailed information of the functions in the javascript files.
  
REFERENCE
---------
  These are the list of references used for this application:
  1. Learning WebGL http://learningwebgl.com/blog/?page_id=1217
  2. Marcel P. Jackowski - Lecture notes from MAC-0420-5744 - Computer Graphics, University of Sao Paulo
  3. K. Matsuda, R. Lea - WebGL Programming Guide, Addison-Wesley, 2013
  4. Shirley & Marschner - Fundamentals of Computer Graphics, 3rd Ed., CRC Press, 2010
  5. Quaternions algebra, http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/index.htm