    const state = {
      activeTab: 'A',
      dragging: null,
      isPlaying: false,
      time: 0,
      config: {
        A: { x: 4, y: 3, z: 0 },
        B: { x: -2, y: 4, z: 1 },
        C: { x: 3, y: -1, z: 2 },
        scalar: 1.5,
        operation: 'add',
        showResult: true,
        showProjection: true,
        showParallelogram: true,
        rotateAngle: 35,
        rotateSpeed: 0.8,
        rotationMode: 'active',
        indexI: 1,
        indexJ: 2,
        indexK: 3,
        interpretMode: 'work',
        tracePath: true,
        unitizeA: false,
        customNameA: 'A',
        customNameB: 'B',
        customNameC: 'C'
      }
    };

    const tabMeta = {
      A: {
        label: 'A',
        name: 'Build a Vector',
        blurb: 'Components, basis, magnitude, direction and unit vector.',
        stage: 'Construct a vector freely, drag it, scale it, normalise it, and watch geometry and algebra stay in sync.'
      },
      B: {
        label: 'B',
        name: 'Combine Vectors',
        blurb: 'Addition, subtraction and scalar multiplication.',
        stage: 'Head-to-tail addition, subtraction, scalar multiplication, and live resultants.'
      },
      C: {
        label: 'C',
        name: 'Products',
        blurb: 'Dot, cross and triple products with intuition.',
        stage: 'Visualise angle, projection, area, orientation and triple-product structure.'
      },
      D: {
        label: 'D',
        name: 'Index Laboratory',
        blurb: 'Aᵢ, δᵢⱼ, εᵢⱼₖ and summation.',
        stage: 'Translate vector notation into index notation and test symbolic building blocks.'
      },
      E: {
        label: 'E',
        name: 'Rotate the World',
        blurb: 'Active vs passive rotations and invariance.',
        stage: 'Rotate vectors or rotate axes and watch components change while the geometry remains meaningful.'
      },
      F: {
        label: 'F',
        name: 'Mechanics Interpretation',
        blurb: 'Work, torque and angular momentum.',
        stage: 'Reuse the same vector ideas in actual mechanics: dot products and cross products become physics.'
      }
    };

    const infoMeta = {
      A: {
        intro: 'A vector is a geometric object with magnitude and direction. The components are not the vector itself: they are the coordinates of the vector in a chosen basis.',
        math: ['A = A_x î + A_y ĵ + A_z k̂', '|A| = √(A_x² + A_y² + A_z²)', 'Â = A / |A|'],
        bullets: [
          'Let the student drag the tip of the vector and watch the algebra update in real time.',
          'Emphasise the distinction between a vector and its component description.',
          'Use unit vectors to explain direction stripped away from magnitude.'
        ]
      },
      B: {
        intro: 'Vector addition is geometric and algebraic at the same time. The head-to-tail picture and the component rule express the same operation.',
        math: ['A ± B = (A_x ± B_x, A_y ± B_y, A_z ± B_z)', 'λA = (λA_x, λA_y, λA_z)'],
        bullets: [
          'Let the learner predict what happens to the resultant before revealing it.',
          'Switch between addition and subtraction to show that subtraction is addition of the opposite vector.',
          'Use scalar multiplication to connect direction reversal and stretching.'
        ]
      },
      C: {
        intro: 'Vector products tell us what part of one vector lies along another, and how two vectors span an oriented area.',
        math: ['A·B = |A||B| cosθ = A_iB_i', '|A×B| = |A||B| sinθ', 'A·(B×C) = signed volume'],
        bullets: [
          'Dot product: projection, alignment, orthogonality and sign.',
          'Cross product: area, orientation and the right-hand rule.',
          'Triple products prepare students for identities and index notation.'
        ]
      },
      D: {
        intro: 'Index notation compresses vector algebra and makes later theoretical mechanics much cleaner.',
        math: ['A_iB_i = Σ_i A_iB_i', 'δ_ij = 1 if i=j, 0 otherwise', '(A×B)_i = ε_ijk A_j B_k'],
        bullets: [
          'Use Einstein summation as a shorthand, not as mysterious symbolism.',
          'Show δ_ij as an index selector.',
          'Show ε_ijk as the antisymmetric object behind the cross product.'
        ]
      },
      E: {
        intro: 'A physical vector and the numbers describing it are not the same thing. Rotations make that distinction beautifully clear.',
        math: ['A′ = R(θ)A', '|A′|² = A′ᵢA′ᵢ = AᵢAᵢ'],
        bullets: [
          'Active rotation: rotate the vector, keep the axes fixed.',
          'Passive rotation: rotate the axes, keep the physical vector fixed.',
          'The components change, but invariant quantities such as magnitude do not.'
        ]
      },
      F: {
        intro: 'The same vector operations become physical quantities in mechanics. One mathematical language supports many physical ideas.',
        math: ['Work: W = F·d', 'Torque: τ = r×F', 'Angular momentum: L = r×p'],
        bullets: [
          'For work, highlight alignment and projection.',
          'For torque and angular momentum, highlight lever arm, perpendicularity and orientation.',
          'This is the bridge from toolkit mathematics into classical mechanics.'
        ]
      }
    };

    const tabGrid = document.getElementById('tabGrid');
    const controlsEl = document.getElementById('controls');
    const infoPanel = document.getElementById('infoPanel');
    const stageTitle = document.getElementById('stageTitle');
    const stageDescription = document.getElementById('stageDescription');
    const modeTag = document.getElementById('modeTag');
    const overlayLeft = document.getElementById('overlayLeft');
    const overlayRight = document.getElementById('overlayRight');
    const equationLine = document.getElementById('equationLine');
    const equationSubline = document.getElementById('equationSubline');
    const playBtn = document.getElementById('playBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const canvas = document.getElementById('vectorCanvas');
    const ctx = canvas.getContext('2d');

    let traceHistory = [];

    function v(x, y, z = 0) { return { x, y, z }; }
    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
    function add(a,b){return v(a.x+b.x,a.y+b.y,a.z+b.z)}
    function sub(a,b){return v(a.x-b.x,a.y-b.y,a.z-b.z)}
    function scale(a,s){return v(a.x*s,a.y*s,a.z*s)}
    function mag(a){return Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z)}
    function dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z}
    function cross(a,b){return v(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x)}
    function unit(a){ const m=mag(a); return m===0?v(0,0,0):scale(a,1/m); }
    function angleDeg(a,b){ const denom = mag(a)*mag(b); if(denom===0) return 0; const c = Math.min(1,Math.max(-1,dot(a,b)/denom)); return Math.acos(c)*180/Math.PI; }
    function rotate2D(vec, angDeg){ const t = angDeg*Math.PI/180; return v(vec.x*Math.cos(t)-vec.y*Math.sin(t), vec.x*Math.sin(t)+vec.y*Math.cos(t), vec.z); }
    function fmt(n, d=2){ return Number.isFinite(n) ? (Math.abs(n) < 1e-10 ? '0.00' : n.toFixed(d)) : '—'; }
    function fmtVec(a, d=2){ return `(${fmt(a.x,d)}, ${fmt(a.y,d)}, ${fmt(a.z,d)})`; }
    function lerp(a,b,t){ return a + (b-a)*t; }

    function scalarTriple(a,b,c){ return dot(a, cross(b,c)); }
    function epsilon(i,j,k){
      if(i===j || j===k || i===k) return 0;
      const perms = ['123','231','312'];
      const s = `${i}${j}${k}`;
      return perms.includes(s) ? 1 : -1;
    }
    function delta(i,j){ return i===j ? 1 : 0; }

    function getResultant(){
      const {A,B,operation,scalar} = state.config;
      if(operation==='add') return add(A,B);
      if(operation==='subtract') return sub(A,B);
      if(operation==='scaleA') return scale(A,scalar);
      if(operation==='scaleB') return scale(B,scalar);
      return add(A,B);
    }

    function buildTabs(){
      tabGrid.innerHTML = '';
      Object.entries(tabMeta).forEach(([key, meta]) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (state.activeTab === key ? ' active' : '');
        btn.innerHTML = `<strong>${meta.label} — ${meta.name}</strong><span>${meta.blurb}</span>`;
        btn.onclick = () => {
          state.activeTab = key;
          state.isPlaying = false;
          traceHistory = [];
          renderAll();
        };
        tabGrid.appendChild(btn);
      });
    }

    function vectorFields(letter) {
      const vec = state.config[letter];
      return `
        <div class="field-grid-3">
          <div><label>${letter}<sub>x</sub></label><input type="number" step="0.1" data-bind="${letter}.x" value="${vec.x}"></div>
          <div><label>${letter}<sub>y</sub></label><input type="number" step="0.1" data-bind="${letter}.y" value="${vec.y}"></div>
          <div><label>${letter}<sub>z</sub></label><input type="number" step="0.1" data-bind="${letter}.z" value="${vec.z}"></div>
        </div>`;
    }

    function commonVectorCards(extra='') {
      return `
        <div class="card">
          <h4>Vector A</h4>
          ${vectorFields('A')}
          <div class="field-grid-2">
            <div><label>Name</label><input type="text" data-custom="customNameA" value="${state.config.customNameA}"></div>
            <div><label>Magnitude</label><input type="text" value="${fmt(mag(state.config.A))}" disabled></div>
          </div>
        </div>
        <div class="card">
          <h4>Vector B</h4>
          ${vectorFields('B')}
          <div class="field-grid-2">
            <div><label>Name</label><input type="text" data-custom="customNameB" value="${state.config.customNameB}"></div>
            <div><label>Magnitude</label><input type="text" value="${fmt(mag(state.config.B))}" disabled></div>
          </div>
        </div>
        ${extra}
      `;
    }

    function buildControls(){
      const c = state.config;
      let html = '';

      if (state.activeTab === 'A') {
        html = `
          <div class="card">
            <h4>Build the vector freely</h4>
            <p class="micro">Drag the violet tip or type in components. Use the play button to animate the scalar λ and watch scaling happen continuously.</p>
            ${vectorFields('A')}
            <div>
              <label>Scale factor λ</label>
              <input type="range" min="-3" max="3" step="0.05" data-custom="scalar" value="${c.scalar}">
              <div class="pill-row"><div class="pill">λ = <strong>${fmt(c.scalar)}</strong></div></div>
            </div>
            <div class="switch-row">
              <label class="toggle"><input type="checkbox" data-custom-check="unitizeA" ${c.unitizeA ? 'checked' : ''}> Show unit vector overlay</label>
              <label class="toggle"><input type="checkbox" data-custom-check="tracePath" ${c.tracePath ? 'checked' : ''}> Trace tip path</label>
            </div>
          </div>
          <div class="card">
            <h4>What to notice</h4>
            <div class="pill-row">
              <div class="pill">Components <strong>A<sub>x</sub>, A<sub>y</sub>, A<sub>z</sub></strong></div>
              <div class="pill">Magnitude <strong>|A|</strong></div>
              <div class="pill">Direction <strong>Â</strong></div>
            </div>
            <p class="small-note">The vector and its components are not the same thing. The vector is the object; the components are its coordinates in a chosen basis.</p>
          </div>
        `;
      }

      if (state.activeTab === 'B') {
        html = commonVectorCards(`
          <div class="card">
            <h4>Choose an operation</h4>
            <label>Operation</label>
            <select data-custom="operation">
              <option value="add" ${c.operation==='add'?'selected':''}>A + B</option>
              <option value="subtract" ${c.operation==='subtract'?'selected':''}>A - B</option>
              <option value="scaleA" ${c.operation==='scaleA'?'selected':''}>λA</option>
              <option value="scaleB" ${c.operation==='scaleB'?'selected':''}>λB</option>
            </select>
            <label style="margin-top:10px;">Scalar λ</label>
            <input type="range" min="-3" max="3" step="0.05" data-custom="scalar" value="${c.scalar}">
            <div class="pill-row">
              <div class="pill">λ = <strong>${fmt(c.scalar)}</strong></div>
              <div class="pill">Result = <strong>${fmtVec(getResultant())}</strong></div>
            </div>
            <div class="switch-row">
              <label class="toggle"><input type="checkbox" data-custom-check="showResult" ${c.showResult ? 'checked' : ''}> Show resultant</label>
              <label class="toggle"><input type="checkbox" data-custom-check="showParallelogram" ${c.showParallelogram ? 'checked' : ''}> Show parallelogram</label>
            </div>
          </div>
        `);
      }

      if (state.activeTab === 'C') {
        html = commonVectorCards(`
          <div class="card">
            <h4>Vector C for triple products</h4>
            ${vectorFields('C')}
            <div class="field-grid-2">
              <div><label>Name</label><input type="text" data-custom="customNameC" value="${c.customNameC}"></div>
              <div><label>|C|</label><input type="text" value="${fmt(mag(c.C))}" disabled></div>
            </div>
          </div>
          <div class="card">
            <h4>Product overlays</h4>
            <div class="switch-row">
              <label class="toggle"><input type="checkbox" data-custom-check="showProjection" ${c.showProjection ? 'checked' : ''}> Show projection</label>
              <label class="toggle"><input type="checkbox" data-custom-check="showParallelogram" ${c.showParallelogram ? 'checked' : ''}> Show area plane</label>
            </div>
            <label style="margin-top:12px;">Rotation speed for B</label>
            <input type="range" min="0.1" max="3" step="0.05" data-custom="rotateSpeed" value="${c.rotateSpeed}">
            <div class="small-note">Press play to rotate vector B continuously so students can watch the dot and cross products change with angle.</div>
          </div>
        `);
      }

      if (state.activeTab === 'D') {
        html = commonVectorCards(`
          <div class="card">
            <h4>Index notation tools</h4>
            <div class="field-grid-3">
              <div><label>i</label><select data-custom="indexI"><option value="1" ${c.indexI===1?'selected':''}>1</option><option value="2" ${c.indexI===2?'selected':''}>2</option><option value="3" ${c.indexI===3?'selected':''}>3</option></select></div>
              <div><label>j</label><select data-custom="indexJ"><option value="1" ${c.indexJ===1?'selected':''}>1</option><option value="2" ${c.indexJ===2?'selected':''}>2</option><option value="3" ${c.indexJ===3?'selected':''}>3</option></select></div>
              <div><label>k</label><select data-custom="indexK"><option value="1" ${c.indexK===1?'selected':''}>1</option><option value="2" ${c.indexK===2?'selected':''}>2</option><option value="3" ${c.indexK===3?'selected':''}>3</option></select></div>
            </div>
            <div class="pill-row">
              <div class="pill">δ<sub>ij</sub> = <strong>${delta(c.indexI,c.indexJ)}</strong></div>
              <div class="pill">ε<sub>ijk</sub> = <strong>${epsilon(c.indexI,c.indexJ,c.indexK)}</strong></div>
            </div>
            <div class="small-note">This section turns vector notation into the language Eleana later uses in angular momentum and symmetry calculations.</div>
          </div>
        `);
      }

      if (state.activeTab === 'E') {
        html = `
          <div class="card">
            <h4>Base vector</h4>
            ${vectorFields('A')}
            <label>Rotation mode</label>
            <select data-custom="rotationMode">
              <option value="active" ${c.rotationMode==='active'?'selected':''}>Active rotation (rotate the vector)</option>
              <option value="passive" ${c.rotationMode==='passive'?'selected':''}>Passive rotation (rotate the axes)</option>
            </select>
            <label style="margin-top:10px;">Rotation angle θ (degrees)</label>
            <input type="range" min="-180" max="180" step="1" data-custom="rotateAngle" value="${c.rotateAngle}">
            <div class="pill-row"><div class="pill">θ = <strong>${fmt(c.rotateAngle,0)}°</strong></div></div>
            <label style="margin-top:10px;">Animation speed</label>
            <input type="range" min="0.1" max="3" step="0.05" data-custom="rotateSpeed" value="${c.rotateSpeed}">
          </div>
          <div class="card">
            <h4>Invariants</h4>
            <p class="micro">Use this to show that the geometric object and its numerical components should not be confused. The component values may change under a basis change, but invariant quantities such as the magnitude stay the same.</p>
          </div>
        `;
      }

      if (state.activeTab === 'F') {
        html = `
          <div class="card">
            <h4>Choose the physical interpretation</h4>
            <label>Mode</label>
            <select data-custom="interpretMode">
              <option value="work" ${c.interpretMode==='work'?'selected':''}>Work: F · d</option>
              <option value="torque" ${c.interpretMode==='torque'?'selected':''}>Torque: r × F</option>
              <option value="angularMomentum" ${c.interpretMode==='angularMomentum'?'selected':''}>Angular momentum: r × p</option>
            </select>
          </div>
          <div class="card">
            <h4>First vector</h4>
            ${vectorFields('A')}
          </div>
          <div class="card">
            <h4>Second vector</h4>
            ${vectorFields('B')}
          </div>
          <div class="card">
            <h4>Guiding idea</h4>
            <p class="micro">The same mathematics gets reused in different physical contexts. Let students adjust the vectors freely and see how the physical quantity changes immediately.</p>
          </div>
        `;
      }

      controlsEl.innerHTML = html;
      wireInputs();
    }

    function buildInfo() {
      const info = infoMeta[state.activeTab];
      infoPanel.innerHTML = `
        <div class="info-block">
          <h3>${tabMeta[state.activeTab].label} — ${tabMeta[state.activeTab].name}</h3>
          <p>${info.intro}</p>
          <div class="math-box">${info.math.join('<br>')}</div>
          ${info.bullets.map(b => `<p>• ${b}</p>`).join('')}
        </div>
      `;
    }

    function wireInputs() {
      controlsEl.querySelectorAll('[data-bind]').forEach(el => {
        el.addEventListener('input', () => {
          const [name, comp] = el.dataset.bind.split('.');
          state.config[name][comp] = parseFloat(el.value || 0);
          renderAll();
        });
      });
      controlsEl.querySelectorAll('[data-custom]').forEach(el => {
        el.addEventListener('input', () => {
          const key = el.dataset.custom;
          let val = el.value;
          if (['scalar','rotateSpeed','rotateAngle'].includes(key)) val = parseFloat(val);
          if (['indexI','indexJ','indexK'].includes(key)) val = parseInt(val);
          state.config[key] = val;
          renderAll();
        });
      });
      controlsEl.querySelectorAll('[data-custom-check]').forEach(el => {
        el.addEventListener('change', () => {
          state.config[el.dataset.customCheck] = el.checked;
          renderAll();
        });
      });
    }

    function renderAll() {
      buildTabs();
      buildControls();
      buildInfo();
      const meta = tabMeta[state.activeTab];
      stageTitle.textContent = `${meta.label} — ${meta.name}`;
      stageDescription.textContent = meta.stage;
      modeTag.textContent = state.isPlaying ? 'Animating' : 'Interactive Lab';
      updateStageText();
      draw();
    }

    function resizeCanvasForDisplay() {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width * ratio);
      const height = Math.floor(rect.height * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(ratio, ratio);
    }

    function axisTransform() {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const scaleVal = Math.min(width, height) / 16;
      const origin = { x: width/2, y: height/2 };
      return { width, height, scaleVal, origin };
    }

    function worldToScreen(pt) {
      const { scaleVal, origin } = axisTransform();
      return { x: origin.x + pt.x * scaleVal, y: origin.y - pt.y * scaleVal };
    }
    function screenToWorld(x, y) {
      const { scaleVal, origin } = axisTransform();
      return { x: (x - origin.x)/scaleVal, y: -(y - origin.y)/scaleVal };
    }

    function drawGrid() {
      const { width, height, scaleVal, origin } = axisTransform();
      ctx.clearRect(0,0,width,height);
      const major = scaleVal;
      ctx.save();
      for (let x = origin.x % major; x < width; x += major) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = origin.y % major; y < height; y += major) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.24)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, height); ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '12px Inter';
      for (let i = -7; i <= 7; i++) {
        if (i !== 0) {
          const sx = origin.x + i*major;
          const sy = origin.y - i*major;
          ctx.fillText(String(i), sx + 4, origin.y + 14);
          ctx.fillText(String(i), origin.x + 4, sy - 4);
        }
      }
      ctx.restore();
    }

    function drawVector(vec, color, label, opts={}) {
      const from = opts.from || v(0,0,0);
      const start = worldToScreen(from);
      const end = worldToScreen(add(from, vec));
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = opts.width || 3.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const head = 12;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head*Math.cos(angle - Math.PI/6), end.y - head*Math.sin(angle - Math.PI/6));
      ctx.lineTo(end.x - head*Math.cos(angle + Math.PI/6), end.y - head*Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fill();
      if (opts.tipCircle !== false) {
        ctx.beginPath();
        ctx.arc(end.x, end.y, opts.tipRadius || 6, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.font = '13px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, end.x + 8, end.y - 10);
      ctx.restore();
      return { start, end };
    }

    function drawDashedLine(a, b, color) {
      const p1 = worldToScreen(a), p2 = worldToScreen(b);
      ctx.save();
      ctx.setLineDash([8,6]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.restore();
    }

    function drawProjection(a, b) {
      const denom = dot(b,b);
      if (denom === 0) return;
      const proj = scale(b, dot(a,b)/denom);
      drawVector(proj, 'rgba(140,231,255,0.9)', 'proj₍B₎A', { width: 2.4, tipRadius: 4 });
      drawDashedLine(proj, a, 'rgba(140,231,255,0.45)');
    }

    function drawParallelogram(a,b) {
      const O = worldToScreen(v(0,0,0));
      const A = worldToScreen(a);
      const B = worldToScreen(b);
      const C = worldToScreen(add(a,b));
      ctx.save();
      ctx.strokeStyle = 'rgba(255,231,155,0.65)';
      ctx.fillStyle = 'rgba(255,231,155,0.1)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(O.x,O.y); ctx.lineTo(A.x,A.y); ctx.lineTo(C.x,C.y); ctx.lineTo(B.x,B.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    function drawTrace() {
      if (!state.config.tracePath || traceHistory.length < 2) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(139,92,246,0.42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      traceHistory.forEach((p, idx) => {
        const s = worldToScreen(v(p.x,p.y,0));
        if (idx === 0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    function updateStageText() {
      const {A,B,C,scalar,operation,rotateAngle,rotationMode,interpretMode,indexI,indexJ,indexK} = state.config;
      let eq = '';
      let sub = '';
      let left = '';
      let right = '';

      if (state.activeTab === 'A') {
        const vecShow = state.config.unitizeA ? unit(A) : scale(A, scalar);
        eq = `${state.config.unitizeA ? 'Â = A / |A|' : 'λA'} = ${fmtVec(vecShow)}`;
        sub = `A = ${fmtVec(A)} · |A| = ${fmt(mag(A))} · Â = ${fmtVec(unit(A))}`;
        left = `
          <h4>Live vector data</h4>
          <p><span class="accent">A</span> = ${fmtVec(A)}</p>
          <p>|A| = ${fmt(mag(A))}</p>
          <p>Â = ${fmtVec(unit(A))}</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>Ask: “If I change only A<sub>x</sub>, what changes? The direction, the magnitude, or both?”</p>
          <p>Use play to animate λ and seal the idea of scaling.</p>`;
      }

      if (state.activeTab === 'B') {
        const R = getResultant();
        eq = operation === 'add' ? `A + B = ${fmtVec(R)}` : operation === 'subtract' ? `A - B = ${fmtVec(R)}` : operation === 'scaleA' ? `λA = ${fmtVec(R)}` : `λB = ${fmtVec(R)}`;
        sub = `A = ${fmtVec(A)} · B = ${fmtVec(B)}`;
        left = `
          <h4>Resultant data</h4>
          <p>Result = ${fmtVec(R)}</p>
          <p>|Result| = ${fmt(mag(R))}</p>
          <p>Angle(A,B) = ${fmt(angleDeg(A,B),1)}°</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>Head-to-tail geometry and component addition are two descriptions of the same operation.</p>
          <p>Use subtraction to show that A − B = A + (−B).</p>`;
      }

      if (state.activeTab === 'C') {
        const d = dot(A,B), cr = cross(A,B), triple = scalarTriple(A,B,C);
        eq = `A·B = ${fmt(d)} · A×B = ${fmtVec(cr)} · A·(B×C) = ${fmt(triple)}`;
        sub = `θ(A,B) = ${fmt(angleDeg(A,B),1)}° · |A×B| = ${fmt(mag(cr))}`;
        left = `
          <h4>Product data</h4>
          <p>A·B = ${fmt(d)}</p>
          <p>|A×B| = ${fmt(mag(cr))}</p>
          <p>A×B = ${fmtVec(cr)}</p>
          <p>A·(B×C) = ${fmt(triple)}</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>Rotate B and ask the student to predict when the dot product becomes zero and when the cross product is maximal.</p>
          <p>The scalar triple product can be described as a signed volume.</p>`;
      }

      if (state.activeTab === 'D') {
        const d = dot(A,B), cr = cross(A,B), eps = epsilon(indexI,indexJ,indexK), del = delta(indexI,indexJ);
        eq = `AᵢBᵢ = ${fmt(d)} · (A×B)ᵢ = εᵢⱼₖ AⱼBₖ`;
        sub = `δᵢⱼ = ${del} · εᵢⱼₖ = ${eps} · A×B = ${fmtVec(cr)}`;
        left = `
          <h4>Symbol builder</h4>
          <p>A₁ = ${fmt(A.x)}, A₂ = ${fmt(A.y)}, A₃ = ${fmt(A.z)}</p>
          <p>B₁ = ${fmt(B.x)}, B₂ = ${fmt(B.y)}, B₃ = ${fmt(B.z)}</p>
          <p>AᵢBᵢ = ${fmt(d)}</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>Explain that repeated indices are summed.</p>
          <p>δᵢⱼ acts like a selector, while εᵢⱼₖ packages orientation and antisymmetry.</p>`;
      }

      if (state.activeTab === 'E') {
        const rotated = rotate2D(A, rotateAngle);
        eq = `${rotationMode === 'active' ? 'A′ = R(θ)A' : 'Components in rotated axes'} = ${fmtVec(rotated)}`;
        sub = `|A| = ${fmt(mag(A))} · |A′| = ${fmt(mag(rotated))} · θ = ${fmt(rotateAngle,0)}°`;
        left = `
          <h4>Rotation data</h4>
          <p>A = ${fmtVec(A)}</p>
          <p>Rotated description = ${fmtVec(rotated)}</p>
          <p>Invariant magnitude = ${fmt(mag(A))}</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>In an active rotation, the vector rotates. In a passive rotation, the coordinate axes rotate.</p>
          <p>This is the bridge to symmetry and orthogonal transformations.</p>`;
      }

      if (state.activeTab === 'F') {
        let name1='F', name2='d', result, desc;
        if (interpretMode === 'work') {
          result = dot(A,B);
          eq = `W = F·d = ${fmt(result)}`;
          sub = `F = ${fmtVec(A)} · d = ${fmtVec(B)} · θ = ${fmt(angleDeg(A,B),1)}°`;
          desc = 'Alignment matters: only the component of force along the displacement contributes to work.';
        } else if (interpretMode === 'torque') {
          name1='r'; name2='F'; result = cross(A,B);
          eq = `τ = r×F = ${fmtVec(result)}`;
          sub = `|τ| = ${fmt(mag(result))} · lever effect strongest near 90°.`;
          desc = 'Torque grows with the perpendicular component of force and the lever arm.';
        } else {
          name1='r'; name2='p'; result = cross(A,B);
          eq = `L = r×p = ${fmtVec(result)}`;
          sub = `|L| = ${fmt(mag(result))} · angular momentum is an axial vector.`;
          desc = 'Angular momentum packages both position and motion into one oriented quantity.';
        }
        left = `
          <h4>Physical data</h4>
          <p>${name1} = ${fmtVec(A)}</p>
          <p>${name2} = ${fmtVec(B)}</p>
          <p>${interpretMode === 'work' ? 'W' : interpretMode === 'torque' ? 'τ' : 'L'} = ${typeof result === 'number' ? fmt(result) : fmtVec(result)}</p>`;
        right = `
          <h4>Teaching cue</h4>
          <p>${desc}</p>
          <p>Use this as the bridge from pure mathematics to classical mechanics.</p>`;
      }

      equationLine.textContent = eq;
      equationSubline.textContent = sub;
      overlayLeft.innerHTML = left;
      overlayRight.innerHTML = right;
    }

    function drawComponentGuides(vec, color) {
      drawDashedLine(v(vec.x,0,0), vec, color);
      drawDashedLine(v(0,0,0), v(vec.x,0,0), color);
    }

    function drawRotationAxes(angle) {
      const { origin, width, height, scaleVal } = axisTransform();
      const t = angle*Math.PI/180;
      const dirX = { x: Math.cos(t), y: -Math.sin(t) };
      const dirY = { x: Math.sin(t), y: Math.cos(t) };
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.setLineDash([10,8]);
      ctx.beginPath();
      ctx.moveTo(origin.x - dirX.x*width, origin.y - dirX.y*width);
      ctx.lineTo(origin.x + dirX.x*width, origin.y + dirX.y*width);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(origin.x - dirY.x*height, origin.y - dirY.y*height);
      ctx.lineTo(origin.x + dirY.x*height, origin.y + dirY.y*height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '13px Inter';
      ctx.fillText("x′", origin.x + dirX.x*scaleVal*4, origin.y + dirX.y*scaleVal*4);
      ctx.fillText("y′", origin.x + dirY.x*scaleVal*4, origin.y + dirY.y*scaleVal*4);
      ctx.restore();
    }

    function draw() {
      resizeCanvasForDisplay();
      drawGrid();
      const c = state.config;
      const A = clone(c.A), B = clone(c.B), C = clone(c.C);
      const nameA = c.customNameA || 'A';
      const nameB = c.customNameB || 'B';
      const nameC = c.customNameC || 'C';

      if (state.activeTab === 'A') {
        drawTrace();
        drawComponentGuides(A, 'rgba(182,156,255,0.35)');
        drawVector(A, 'rgba(139,92,246,0.95)', nameA, { tipRadius: 8 });
        const scaled = scale(A, c.scalar);
        drawVector(scaled, 'rgba(255,255,255,0.82)', `λ${nameA}`, { width: 2.4, tipRadius: 5 });
        if (c.unitizeA && mag(A) !== 0) drawVector(unit(A), 'rgba(140,231,255,0.95)', `Â`, { width: 2.2, tipRadius: 4 });
      }

      if (state.activeTab === 'B') {
        drawVector(A, 'rgba(139,92,246,0.95)', nameA, { tipRadius: 7 });
        drawVector(B, 'rgba(255,112,150,0.92)', nameB, { tipRadius: 7 });
        const R = getResultant();
        if (c.showParallelogram && (c.operation==='add' || c.operation==='subtract')) drawParallelogram(A, c.operation==='add' ? B : scale(B,-1));
        if (c.showResult) drawVector(R, 'rgba(255,255,255,0.95)', 'Result', { tipRadius: 8, width: 3.5 });
        if (c.operation === 'add') drawVector(B, 'rgba(255,112,150,0.55)', `${nameB} (shifted)`, { from: A, width: 2, tipRadius: 4 });
        if (c.operation === 'subtract') drawVector(scale(B,-1), 'rgba(255,112,150,0.55)', `-${nameB}`, { from: A, width: 2, tipRadius: 4 });
      }

      if (state.activeTab === 'C') {
        drawVector(A, 'rgba(139,92,246,0.95)', nameA, { tipRadius: 7 });
        drawVector(B, 'rgba(255,112,150,0.92)', nameB, { tipRadius: 7 });
        if (c.showProjection) drawProjection(A,B);
        if (c.showParallelogram) drawParallelogram(A,B);
        drawVector(C, 'rgba(184,255,206,0.92)', nameC, { tipRadius: 6, width: 2.4 });
      }

      if (state.activeTab === 'D') {
        drawVector(A, 'rgba(139,92,246,0.95)', `${nameA}`, { tipRadius: 7 });
        drawVector(B, 'rgba(255,112,150,0.92)', `${nameB}`, { tipRadius: 7 });
        const cr = cross(A,B);
        drawVector(v(cr.x, cr.y, 0), 'rgba(140,231,255,0.92)', 'A×B (xy-proj)', { tipRadius: 6, width: 2.6 });
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '16px Crimson Text';
        ctx.fillText(`AᵢBᵢ = A₁B₁ + A₂B₂ + A₃B₃ = ${fmt(dot(A,B))}`, 24, 34);
        ctx.fillText(`δᵢⱼ = ${delta(c.indexI,c.indexJ)}    εᵢⱼₖ = ${epsilon(c.indexI,c.indexJ,c.indexK)}`, 24, 58);
        ctx.restore();
      }

      if (state.activeTab === 'E') {
        drawVector(A, 'rgba(255,255,255,0.45)', 'A', { tipRadius: 5, width: 2.2 });
        if (c.rotationMode === 'active') {
          const Ar = rotate2D(A, c.rotateAngle);
          drawVector(Ar, 'rgba(139,92,246,0.95)', 'A′', { tipRadius: 7 });
        } else {
          drawRotationAxes(c.rotateAngle);
          drawVector(A, 'rgba(139,92,246,0.95)', 'A', { tipRadius: 7 });
          const Ap = rotate2D(A, -c.rotateAngle);
          drawVector(Ap, 'rgba(140,231,255,0.9)', '[A]′', { tipRadius: 6, width: 2.4 });
        }
      }

      if (state.activeTab === 'F') {
        let label1='F', label2='d', color2='rgba(255,112,150,0.92)';
        if (c.interpretMode === 'torque') { label1='r'; label2='F'; }
        if (c.interpretMode === 'angularMomentum') { label1='r'; label2='p'; color2='rgba(184,255,206,0.95)'; }
        drawVector(A, 'rgba(139,92,246,0.95)', label1, { tipRadius: 7 });
        drawVector(B, color2, label2, { tipRadius: 7 });
        if (c.interpretMode === 'work') {
          drawProjection(B,A);
        } else {
          drawParallelogram(A,B);
          const cr = cross(A,B);
          drawVector(v(cr.x,cr.y,0), 'rgba(255,255,255,0.92)', c.interpretMode === 'torque' ? 'τ (xy-proj)' : 'L (xy-proj)', { tipRadius: 6, width: 2.6 });
        }
      }
    }

    function updateAnimation(dt) {
      const c = state.config;
      state.time += dt;

      if (state.activeTab === 'A') {
        c.scalar = 2.2 * Math.sin(state.time * c.rotateSpeed);
        if (c.tracePath) {
          const tip = scale(c.A, c.scalar);
          traceHistory.push({ x: tip.x, y: tip.y });
          if (traceHistory.length > 260) traceHistory.shift();
        }
      }
      if (state.activeTab === 'C') {
        c.B = rotate2D(c.B, c.rotateSpeed * dt * 50);
      }
      if (state.activeTab === 'E') {
        c.rotateAngle += c.rotateSpeed * dt * 50;
        if (c.rotateAngle > 180) c.rotateAngle -= 360;
      }
      renderAll();
    }

    let lastTs = 0;
    function loop(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs)/1000);
      lastTs = ts;
      if (state.isPlaying) updateAnimation(dt);
      else draw();
      requestAnimationFrame(loop);
    }

    playBtn.addEventListener('click', () => {
      state.isPlaying = !state.isPlaying;
      playBtn.textContent = state.isPlaying ? '❚❚ Pause' : '▶ Play';
      modeTag.textContent = state.isPlaying ? 'Animating' : 'Interactive Lab';
      if (!state.isPlaying) renderAll();
    });

    resetViewBtn.addEventListener('click', () => {
      state.config = {
        ...state.config,
        A: { x: 4, y: 3, z: 0 },
        B: { x: -2, y: 4, z: 1 },
        C: { x: 3, y: -1, z: 2 },
        scalar: 1.5,
        operation: 'add',
        rotateAngle: 35,
        rotateSpeed: 0.8,
        indexI: 1, indexJ: 2, indexK: 3,
        interpretMode: 'work',
        tracePath: true,
        unitizeA: false,
        rotationMode: 'active',
        showProjection: true,
        showParallelogram: true,
        showResult: true
      };
      traceHistory = [];
      state.isPlaying = false;
      playBtn.textContent = '▶ Play';
      renderAll();
    });

    function hitTestVectors(mx, my) {
      const candidates = [];
      const tabsAllowB = ['B','C','D','F'];
      candidates.push({ key: 'A', screen: worldToScreen(state.config.A) });
      if (tabsAllowB.includes(state.activeTab)) candidates.push({ key: 'B', screen: worldToScreen(state.config.B) });
      if (state.activeTab === 'C') candidates.push({ key: 'C', screen: worldToScreen(state.config.C) });
      if (state.activeTab === 'E') candidates.length = 0, candidates.push({ key: 'A', screen: worldToScreen(state.config.A) });
      let best = null;
      candidates.forEach(c => {
        const d = Math.hypot(mx - c.screen.x, my - c.screen.y);
        if (d < 16 && (!best || d < best.d)) best = { key: c.key, d };
      });
      return best ? best.key : null;
    }

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      state.dragging = hitTestVectors(mx, my);
    });
    window.addEventListener('mouseup', () => state.dragging = null);
    canvas.addEventListener('mousemove', (e) => {
      if (!state.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const world = screenToWorld(mx, my);
      state.config[state.dragging].x = Number(world.x.toFixed(2));
      state.config[state.dragging].y = Number(world.y.toFixed(2));
      renderAll();
    });

    window.addEventListener('resize', draw);
    renderAll();
    requestAnimationFrame(loop);