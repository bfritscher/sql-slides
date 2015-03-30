var redraw;
jQuery(document).ready(function(){
var angle = 60;

var counter = 0;
var color = ''

function nextColor(){
    color = '#f00'  === color ? '#000' : '#f00';
    return color;
}

function koch(p, distance, noLevel) {
    if(noLevel === 0){
        if(counter % 4 === 0){
            p.penstyle(nextColor());
        }
        p.go(distance);
        p.draw();
        p.jump(p.x, p.y);
        counter++;
    } else {
        noLevel = noLevel - 1;
        distance = distance / 3;
        koch(p, distance, noLevel);
        p.turn(-angle);
        koch(p, distance, noLevel);
        p.turn(2* angle);
        koch(p, distance, noLevel);
        p.turn(-angle);
        koch(p, distance, noLevel);
    }
}

function drawKoch(){
    var p = new Pen('kochcanvas');
    var distance = 500;
    var nbLevel = Number(document.getElementById('numberRecursion').value);
    p.pensize(2/Math.pow(1.8, nbLevel));
    document.getElementById('displayNumber').innerHTML = nbLevel;
    p.jump(150, 200);
    p.turn(90);
    counter = 0;
    p.penstyle('#f00');
    koch(p, distance, nbLevel );
    if(isTriangle.checked){
        p.turn(120);   
        koch(p, distance, nbLevel );
        p.turn(120);   
        koch(p, distance, nbLevel );
    }  
}

// code to drag and zoom
//http://phrogz.net/tmp/canvas_zoom_to_cursor.html
var canvas = document.getElementById('kochcanvas');
console.log('test', canvas.getContext('2d'));
canvas.width = 800; canvas.height = 600;
var ctx = canvas.getContext('2d');

redraw = function(){
    // Clear the entire canvas
    var p1 = ctx.transformedPoint(0,0);
    var p2 = ctx.transformedPoint(canvas.width,canvas.height);
    ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    drawKoch();
};

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx){
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function(){ return xform; };
    
    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(ctx,sx,sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(ctx,radians);
    };
    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(ctx,dx,dy);
    };
    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
        var m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(ctx,a,b,c,d,e,f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx,a,b,c,d,e,f);
    };
    var pt  = svg.createSVGPoint();
    ctx.transformedPoint = function(x,y){
        pt.x=x;
        pt.y=y;
        return pt.matrixTransform(xform.inverse());
    };
}

var lastX=canvas.width/2, lastY=canvas.height/2;
var dragStart,dragged;
var scaleFactor = 1.1;
canvas.addEventListener('mousedown',function(evt){
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX,lastY);
    dragged = false;
},false);
canvas.addEventListener('mousemove',function(evt){
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart){
        var pt = ctx.transformedPoint(lastX,lastY);
        ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
        redraw();
    }
},false);

var zoom = function(clicks){
    var pt = ctx.transformedPoint(lastX,lastY);
    ctx.translate(pt.x,pt.y);
    var factor = Math.pow(scaleFactor,clicks);
    ctx.scale(factor,factor);
    ctx.translate(-pt.x,-pt.y);
    redraw();
};

canvas.addEventListener('mouseup',function(evt){
    dragStart = null;
    if (!dragged){
         zoom(evt.shiftKey ? -1 : 1 );
    }
},false);

var handleScroll = function(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta){
        zoom(delta);
    }
    return evt.preventDefault() && false;
};
canvas.addEventListener('DOMMouseScroll',handleScroll,false);
canvas.addEventListener('mousewheel',handleScroll,false);
trackTransforms(ctx);
redraw();
});