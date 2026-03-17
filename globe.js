// ─── GLOBE RENDERER ──────────────────────────────────────────────────────────
// Real-world continent outlines using simplified geographic coordinates [lon, lat]
// Rendered onto a rotating sphere using orthographic projection

(function() {

  // ── Continent polygon data (lon/lat degrees, simplified outlines) ───────────
  const CONTINENTS = [
    {
      name: 'north_america',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [-168,72],[-140,70],[-120,72],[-100,73],[-85,70],[-75,68],[-65,62],
        [-55,58],[-55,48],[-65,42],[-70,35],[-76,26],[-82,24],[-88,20],
        [-90,16],[-84,10],[-78,8],[-75,10],[-72,12],[-70,18],[-74,22],
        [-80,24],[-86,28],[-92,30],[-96,32],[-98,36],[-100,40],[-104,42],
        [-110,42],[-116,44],[-120,42],[-122,38],[-118,34],[-116,30],
        [-110,24],[-105,22],[-100,20],[-96,20],[-92,18],[-90,16],
        [-86,10],[-80,8],[-75,10],[-76,26],[-72,22],[-68,18],[-64,14],
        [-62,10],[-60,8],[-62,6],[-58,4],[-55,2],[-52,4],[-50,6],
        [-48,8],[-46,12],[-44,16],[-42,20],[-38,18],[-36,14],[-34,10],
        [-52,0],[-56,-4],[-60,-8],[-64,-12],[-68,-16],[-70,-20],
        // back up north america
        [-75,-10],[-80,-5],[-78,2],[-76,6],[-72,10],[-70,14],
        [-68,18],[-64,22],[-60,26],[-55,30],[-52,34],[-50,38],
        [-52,42],[-56,46],[-60,48],[-64,50],[-68,52],[-70,55],
        [-74,58],[-78,62],[-82,64],[-86,66],[-92,68],[-100,70],
        [-110,72],[-130,72],[-148,72],[-168,72]
      ]]
    },
    {
      name: 'south_america',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [-80,10],[-76,8],[-72,10],[-68,12],[-62,10],[-58,6],[-52,4],
        [-50,2],[-48,0],[-50,-4],[-52,-8],[-54,-12],[-58,-16],[-62,-20],
        [-64,-24],[-66,-28],[-68,-32],[-70,-36],[-72,-40],[-74,-44],
        [-72,-48],[-70,-52],[-68,-54],[-66,-56],[-64,-54],[-62,-52],
        [-60,-50],[-58,-48],[-56,-46],[-54,-42],[-52,-38],[-50,-34],
        [-48,-30],[-44,-24],[-42,-20],[-40,-16],[-38,-12],[-38,-8],
        [-36,-4],[-34,0],[-36,4],[-40,6],[-44,8],[-48,10],
        [-52,8],[-56,6],[-60,8],[-64,10],[-68,10],[-72,10],[-76,8],[-80,10]
      ]]
    },
    {
      name: 'europe',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [-10,36],[-6,36],[-2,36],[2,36],[6,38],[10,40],[14,38],[18,38],
        [22,38],[26,38],[28,40],[30,42],[32,44],[30,46],[28,48],[26,50],
        [24,52],[22,54],[20,56],[18,58],[16,60],[14,62],[12,64],
        [10,62],[8,60],[6,58],[4,56],[2,52],[0,50],[-2,48],
        [-4,46],[-6,44],[-8,42],[-10,40],[-10,36]
      ], [
        [20,42],[22,44],[26,46],[28,48],[26,50],[24,52],[22,54],
        [18,54],[16,56],[14,56],[12,54],[14,52],[16,50],[18,48],
        [20,46],[22,44],[20,42]
      ], [
        [26,46],[28,44],[30,42],[32,44],[34,46],[36,48],[38,50],
        [36,52],[34,54],[32,54],[30,52],[28,50],[26,48],[26,46]
      ], [
        [36,48],[40,50],[44,52],[48,54],[52,56],[50,58],[48,58],
        [44,56],[40,54],[36,52],[36,48]
      ]]
    },
    {
      name: 'africa',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [-18,16],[-14,16],[-10,14],[-6,12],[-2,10],[2,8],[6,6],
        [10,6],[14,6],[18,6],[22,6],[26,4],[30,2],[34,0],[36,-2],
        [38,-4],[40,-8],[42,-12],[44,-16],[44,-20],[44,-24],[42,-28],
        [40,-32],[36,-34],[32,-34],[28,-34],[24,-34],[20,-32],[16,-30],
        [14,-26],[12,-22],[10,-18],[8,-14],[6,-10],[4,-6],[2,-2],
        [0,2],[-2,6],[-4,10],[-6,14],[-8,16],[-10,16],[-12,16],
        [-14,18],[-16,18],[-18,16]
      ], [
        [30,2],[32,4],[34,6],[36,8],[38,10],[40,12],[42,14],
        [44,12],[46,10],[48,8],[50,10],[52,12],[50,14],[48,14],
        [46,12],[44,14],[42,16],[40,14],[38,12],[36,10],[34,8],
        [32,6],[30,4],[30,2]
      ]]
    },
    {
      name: 'asia',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [26,42],[30,44],[34,46],[38,48],[42,46],[46,44],[50,42],
        [54,42],[58,42],[62,42],[66,42],[70,42],[74,42],[78,42],
        [82,42],[86,44],[90,46],[94,48],[98,50],[102,52],[106,54],
        [110,56],[114,58],[118,58],[122,56],[126,52],[130,48],[134,44],
        [138,40],[140,36],[140,32],[138,28],[136,24],[132,22],[128,20],
        [124,18],[120,16],[116,14],[112,12],[108,10],[104,8],[100,6],
        [96,4],[92,2],[88,2],[84,4],[80,6],[76,8],[72,8],[68,8],
        [64,10],[60,12],[56,14],[52,16],[48,14],[44,12],[40,10],
        [36,10],[32,10],[28,10],[26,12],[24,14],[22,16],[20,18],
        [22,20],[24,22],[26,24],[28,26],[30,28],[32,30],[34,32],
        [36,34],[36,38],[34,40],[30,42],[26,42]
      ], [
        // Japan
        [130,32],[132,34],[134,36],[136,36],[138,36],[140,38],
        [140,36],[138,34],[136,32],[134,30],[132,30],[130,32]
      ], [
        // Korean peninsula
        [126,34],[128,36],[130,38],[130,36],[128,34],[126,34]
      ], [
        // Indian subcontinent extension
        [68,22],[70,20],[72,18],[74,16],[76,14],[78,12],[80,10],
        [78,8],[76,8],[74,10],[72,12],[70,14],[68,16],[66,20],[68,22]
      ]]
    },
    {
      name: 'australia',
      color: 'rgba(200,170,255,0.95)',
      polygons: [[
        [114,-22],[116,-20],[120,-18],[124,-16],[128,-14],[132,-12],
        [136,-12],[140,-14],[144,-16],[148,-18],[150,-20],[152,-22],
        [154,-24],[154,-28],[152,-32],[150,-36],[148,-38],[146,-38],
        [144,-38],[142,-38],[140,-36],[138,-34],[136,-34],[134,-32],
        [132,-30],[130,-28],[128,-26],[126,-24],[124,-22],[122,-22],
        [118,-22],[114,-22]
      ]]
    },
    {
      name: 'greenland',
      color: 'rgba(200,170,255,0.85)',
      polygons: [[
        [-44,76],[-38,74],[-30,72],[-22,70],[-18,68],[-20,66],
        [-24,64],[-28,62],[-32,62],[-36,64],[-40,66],[-44,68],
        [-48,70],[-50,72],[-48,74],[-44,76]
      ]]
    }
  ];

  // ── City/node positions [lon, lat] for connection lines ──────────────────────
  const NODES = [
    { name: 'New York',     lon: -74,  lat: 41  },
    { name: 'London',       lon: 0,    lat: 51  },
    { name: 'Moscow',       lon: 37,   lat: 56  },
    { name: 'Beijing',      lon: 116,  lat: 40  },
    { name: 'Tokyo',        lon: 140,  lat: 36  },
    { name: 'Dubai',        lon: 55,   lat: 25  },
    { name: 'Singapore',    lon: 104,  lat: 1   },
    { name: 'Johannesburg', lon: 28,   lat: -26 },
    { name: 'São Paulo',    lon: -46,  lat: -23 },
    { name: 'Sydney',       lon: 151,  lat: -34 },
    { name: 'Mumbai',       lon: 73,   lat: 19  },
    { name: 'Cairo',        lon: 31,   lat: 30  },
    { name: 'Lagos',        lon: 3,    lat: 6   },
    { name: 'Los Angeles',  lon: -118, lat: 34  },
  ];

  // ── Connection pairs ──────────────────────────────────────────────────────────
  const CONNECTIONS = [
    [0, 1], [0, 8], [0, 13],
    [1, 2], [1, 11], [1, 12],
    [2, 3], [2, 6],
    [3, 4], [3, 5], [3, 6],
    [5, 7], [5, 11],
    [6, 9], [6, 10],
    [1, 3], [0, 3],
    [7, 11], [8, 12],
    [4, 9],
  ];

  // ── Canvas setup ──────────────────────────────────────────────────────────────
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const SIZE = 300;
  const R = 136;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.style.width = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  canvas.style.cursor = 'grab';

  let rotation = 0;
  const ROT_SPEED = 0.0025;

  // ── Interaction state ─────────────────────────────────────────────────────────
  let isDragging   = false;
  let dragStartX   = 0;
  let dragStartRot = 0;
  let velocity     = 0;       // momentum in radians/frame
  let lastDragX    = 0;
  let lastDragTime = 0;
  let autoSpin     = true;    // auto-spin when not held

  function getCanvasX(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - rect.left) * (SIZE / rect.width);
  }

  function onPointerDown(e) {
    isDragging   = true;
    autoSpin     = false;
    dragStartX   = getCanvasX(e);
    dragStartRot = rotation;
    lastDragX    = dragStartX;
    lastDragTime = Date.now();
    velocity     = 0;
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x    = getCanvasX(e);
    const now  = Date.now();
    const dt   = Math.max(1, now - lastDragTime);
    velocity   = (x - lastDragX) / dt * 16; // radians per frame (approx)
    lastDragX  = x;
    lastDragTime = now;
    rotation   = dragStartRot + (x - dragStartX) * (Math.PI / (SIZE * 0.5));
    e.preventDefault();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    canvas.style.cursor = 'grab';
    // Convert velocity to radians/frame
    velocity = velocity * (Math.PI / (SIZE * 0.5));
    autoSpin = false; // keep momentum, re-enable auto once it dies
  }

  // Mouse events
  canvas.addEventListener('mousedown',  onPointerDown);
  window.addEventListener('mousemove',  onPointerMove);
  window.addEventListener('mouseup',    onPointerUp);
  // Touch events
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove',  onPointerMove, { passive: false });
  window.addEventListener('touchend',   onPointerUp);

  // Hover glow hint
  canvas.addEventListener('mouseenter', () => { if (!isDragging) canvas.style.cursor = 'grab'; });

  // ── Active arcs state ─────────────────────────────────────────────────────────
  const MAX_ARCS = 5;
  let arcs = [];

  function spawnArc() {
    const pair = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
    arcs.push({
      from: pair[0],
      to:   pair[1],
      progress: 0,
      speed: 0.004 + Math.random() * 0.003,
      opacity: 0,
      fadeIn: true,
    });
  }

  // Pre-seed arcs with staggered progress
  for (let i = 0; i < MAX_ARCS; i++) {
    spawnArc();
    arcs[i].progress = (i / MAX_ARCS);
  }

  // ── Math helpers ──────────────────────────────────────────────────────────────
  function toRad(deg) { return deg * Math.PI / 180; }

  // Project [lon, lat] to canvas [x, y], returns null if behind sphere
  function project(lon, lat, rot) {
    const phi   = toRad(lat);
    const theta = toRad(lon) + rot;

    const x = Math.cos(phi) * Math.sin(theta);
    const y = Math.sin(phi);
    const z = Math.cos(phi) * Math.cos(theta);

    if (z < 0) return null; // behind globe

    return {
      x: CX + R * x,
      y: CY - R * y,
      z: z
    };
  }

  // Great-circle interpolation between two [lon, lat] points
  function greatCirclePoint(lon1, lat1, lon2, lat2, t) {
    const p1 = [
      Math.cos(toRad(lat1)) * Math.cos(toRad(lon1)),
      Math.cos(toRad(lat1)) * Math.sin(toRad(lon1)),
      Math.sin(toRad(lat1))
    ];
    const p2 = [
      Math.cos(toRad(lat2)) * Math.cos(toRad(lon2)),
      Math.cos(toRad(lat2)) * Math.sin(toRad(lon2)),
      Math.sin(toRad(lat2))
    ];

    const dot = p1[0]*p2[0] + p1[1]*p2[1] + p1[2]*p2[2];
    const omega = Math.acos(Math.min(1, Math.max(-1, dot)));
    if (omega < 0.001) return { lon: lon1, lat: lat1 };

    const s = Math.sin(omega);
    const a = Math.sin((1 - t) * omega) / s;
    const b = Math.sin(t * omega) / s;

    const x = a * p1[0] + b * p2[0];
    const y = a * p1[1] + b * p2[1];
    const z = a * p1[2] + b * p2[2];

    const lat = Math.asin(z) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;
    return { lon, lat };
  }

  // ── Draw ocean (sphere base) ──────────────────────────────────────────────────
  function drawOcean() {
    const grad = ctx.createRadialGradient(CX - 30, CY - 30, 10, CX, CY, R);
    grad.addColorStop(0,   '#2a2050');
    grad.addColorStop(0.6, '#1a1535');
    grad.addColorStop(1,   '#0f0c22');

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle border glow
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167,139,250,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ── Draw latitude/longitude grid lines ─────────────────────────────────────
  function drawGrid(rot) {
    ctx.save();
    ctx.clip(); // clip to sphere (circle path already set)

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      let started = false;
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 4) {
        const pt = project(lon, lat, rot);
        if (!pt) { started = false; continue; }
        if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(139,92,246,0.18)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = -180; lon < 180; lon += 30) {
      let started = false;
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 4) {
        const pt = project(lon, lat, rot);
        if (!pt) { started = false; continue; }
        if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(139,92,246,0.18)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Draw continents ───────────────────────────────────────────────────────────
  function drawContinents(rot) {
    for (const continent of CONTINENTS) {
      for (const poly of continent.polygons) {
        // Sample visibility: skip if majority of points are behind
        let visCount = 0;
        for (let i = 0; i < poly.length; i += 3) {
          const pt = project(poly[i][0], poly[i][1], rot);
          if (pt) visCount++;
        }
        if (visCount === 0) continue;

        ctx.beginPath();
        let started = false;
        let lastVisible = true;

        for (let i = 0; i < poly.length; i++) {
          const [lon, lat] = poly[i];
          const pt = project(lon, lat, rot);

          if (!pt) {
            lastVisible = false;
            continue;
          }
          if (!started || !lastVisible) {
            ctx.moveTo(pt.x, pt.y);
            started = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
          lastVisible = true;
        }

        if (started) {
          ctx.closePath();
          ctx.fillStyle = continent.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(220,190,255,0.7)';
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
  }

  // ── Draw connection arcs (red) ────────────────────────────────────────────────
  function drawArcs(rot) {
    for (const arc of arcs) {
      const nodeA = NODES[arc.from];
      const nodeB = NODES[arc.to];

      const STEPS = 60;
      const drawnSteps = Math.floor(arc.progress * STEPS);
      if (drawnSteps < 2) continue;

      // Check if the arc start is visible
      const startPt = project(nodeA.lon, nodeA.lat, rot);
      const endPt   = project(nodeB.lon, nodeB.lat, rot);

      ctx.beginPath();
      let started = false;
      let anyVisible = false;

      for (let s = 0; s <= drawnSteps; s++) {
        const t = s / STEPS;
        const gc = greatCirclePoint(nodeA.lon, nodeA.lat, nodeB.lon, nodeB.lat, t);
        const pt = project(gc.lon, gc.lat, rot);

        if (!pt) { started = false; continue; }
        anyVisible = true;
        if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
        else ctx.lineTo(pt.x, pt.y);
      }

      if (anyVisible) {
        ctx.strokeStyle = `rgba(220, 40, 40, ${arc.opacity * 0.85})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling dot at front of arc
        const tipT = arc.progress;
        const tipGC = greatCirclePoint(nodeA.lon, nodeA.lat, nodeB.lon, nodeB.lat, tipT);
        const tipPt = project(tipGC.lon, tipGC.lat, rot);
        if (tipPt) {
          ctx.beginPath();
          ctx.arc(tipPt.x, tipPt.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 60, 60, ${arc.opacity})`;
          ctx.fill();

          // Glow
          ctx.beginPath();
          ctx.arc(tipPt.x, tipPt.y, 5, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(tipPt.x, tipPt.y, 0, tipPt.x, tipPt.y, 5);
          grd.addColorStop(0, `rgba(255,60,60,${arc.opacity * 0.4})`);
          grd.addColorStop(1, 'rgba(255,60,60,0)');
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }

      // Draw city node dots
      if (startPt) {
        ctx.beginPath();
        ctx.arc(startPt.x, startPt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 80, 80, ${arc.opacity * 0.7})`;
        ctx.fill();
      }
      if (endPt && arc.progress > 0.95) {
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 80, 80, ${arc.opacity * arc.progress})`;
        ctx.fill();
      }
    }
  }

  // ── Draw specular highlight ───────────────────────────────────────────────────
  function drawHighlight() {
    const hGrad = ctx.createRadialGradient(CX - 44, CY - 44, 4, CX - 30, CY - 30, 90);
    hGrad.addColorStop(0,   'rgba(255,255,255,0.07)');
    hGrad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    hGrad.addColorStop(1,   'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = hGrad;
    ctx.fill();
  }

  // ── Update arcs ───────────────────────────────────────────────────────────────
  function updateArcs() {
    for (let i = arcs.length - 1; i >= 0; i--) {
      const arc = arcs[i];
      arc.progress += arc.speed;

      // Fade in
      if (arc.fadeIn) {
        arc.opacity = Math.min(1, arc.opacity + 0.03);
        if (arc.opacity >= 1) arc.fadeIn = false;
      }

      // Fade out near end
      if (arc.progress > 0.8) {
        arc.opacity = Math.max(0, 1 - (arc.progress - 0.8) / 0.2);
      }

      if (arc.progress >= 1) {
        arcs.splice(i, 1);
        spawnArc();
      }
    }

    // Maintain arc count
    while (arcs.length < MAX_ARCS) spawnArc();
  }

  // ── Main render loop ──────────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.clip();

    drawOcean();
    drawGrid(rotation);
    drawContinents(rotation);
    drawArcs(rotation);
    drawHighlight();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = isDragging ? 'rgba(200,170,255,0.85)' : 'rgba(167,139,250,0.7)';
    ctx.lineWidth = isDragging ? 2 : 1.5;
    ctx.stroke();

    if (!isDragging) {
      if (Math.abs(velocity) > 0.00005) {
        // Momentum decay
        rotation += velocity;
        velocity *= 0.96;
        if (Math.abs(velocity) < 0.00005) {
          velocity = 0;
          autoSpin = true;
        }
      } else {
        // Auto-spin resumes
        autoSpin = true;
      }
      if (autoSpin) rotation += ROT_SPEED;
    }

    updateArcs();
    requestAnimationFrame(render);
  }

  render();

})();
