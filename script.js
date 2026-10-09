const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const screens = ["home","maze","puzzle","memory","letter","music","galaxy","ending"];
let current = "home";
function showScreen(id){screens.forEach(s=>$("#"+s).classList.toggle("active",s===id));current=id;window.scrollTo({top:0,behavior:"smooth"});}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300)}
function confetti(){for(let i=0;i<28;i++){const e=document.createElement("span");e.textContent=["💗","✨","🌸","⭐"][Math.floor(Math.random()*4)];e.style.cssText=`position:fixed;z-index:99;left:${Math.random()*100}vw;top:-25px;font-size:${14+Math.random()*18}px;pointer-events:none;transition:transform 2s linear,opacity 2s;`;document.body.append(e);requestAnimationFrame(()=>{e.style.transform=`translateY(${window.innerHeight+50}px) rotate(${Math.random()*500}deg)`;e.style.opacity=0});setTimeout(()=>e.remove(),2200)}}
function next(id){confetti();showScreen(id)}
$("#startBtn").onclick=()=>{resetMaze();showScreen("maze")};
$("#replayBtn").onclick=()=>{location.reload()};
let mazeMap=[
"#########",
"#S..#...#",
"##..#.#.#",
"#...C.#.#",
"#.###...#",
"#C....#.#",
"#.##C...#",
"#.....#.T",
"#########"
];
let player={r:1,c:1},carrots=0,quizIndex=0,solvedCarrots=new Set();
const mazeQuestions=[
{q:"Thỏ thích màu gì?",answers:["Màu hồng 💗","Màu xanh dương 💙"],correct:0,msg:"Đúng rùi, anh iu nhớ giỏi quáaa! 💗"},
{q:"Cung hoàng đạo của Thỏ là gì?",answers:["Ma Kết ♑","Song Ngư ♓"],correct:1,msg:"Chính xác luôn! Anh hiểu Thỏ ghê á 🐰💕"},
{q:"Thỏ thích hoa gì?",answers:["Hoa hồng 🌹","Hoa hướng dương 🌻"],correct:1,msg:"Đúng rùi anh iu! Tặng anh một cái ôm nè 🦔💗"}
];
function resetMaze(){player={r:1,c:1};carrots=0;quizIndex=0;solvedCarrots=new Set();$("#carrotQuiz").classList.add("hidden");renderMaze()}
function renderMaze(){const g=$("#mazeGrid");g.innerHTML="";mazeMap.forEach((row,r)=>[...row].forEach((ch,c)=>{const cell=document.createElement("div");cell.className="maze-cell";if(ch==="#")cell.classList.add("wall");if(ch==="C")cell.classList.add("carrot");if(r===player.r&&c===player.c){cell.classList.add("player");cell.textContent="🦔"}else if(ch==="T") {cell.classList.add("goal");cell.textContent="🐰"}else if(ch==="C"&&!solvedCarrots.has(`${r},${c}`)){cell.textContent="🥕"}g.append(cell)}))}
function moveMaze(dr,dc){if(current!=="maze"||!$("#carrotQuiz").classList.contains("hidden"))return;const nr=player.r+dr,nc=player.c+dc;if(!mazeMap[nr]||mazeMap[nr][nc]==="#"||!mazeMap[nr][nc])return;player={r:nr,c:nc};const ch=mazeMap[nr][nc];renderMaze();if(ch==="C"&&!solvedCarrots.has(`${nr},${nc}`)&&carrots<3){askCarrot(nr,nc)}else if(ch==="T"){next("puzzle")}}
function askCarrot(r,c){const q=mazeQuestions[carrots];if(!q)return;quizIndex=carrots;$("#carrotQuiz").classList.remove("hidden");$("#carrotCount").textContent=`CỦ CÀ RỐT ${carrots+1}/3`;$("#carrotQuestion").textContent=q.q;$("#carrotFeedback").textContent="";const o=$("#carrotOptions");o.innerHTML="";q.answers.forEach((a,i)=>{const b=document.createElement("button");b.textContent=a;b.onclick=()=>{if(i===q.correct){b.classList.add("correct");$("#carrotFeedback").textContent=q.msg;carrots++;solvedCarrots.add(`${r},${c}`);setTimeout(()=>{$("#carrotQuiz").classList.add("hidden");renderMaze();if(carrots===3)toast("Cả 3 câu đều đúng! Tìm Thỏ thôi anh iu 🐰");},900)}else{b.classList.add("wrong");$("#carrotFeedback").textContent="Gần đúng rùi, anh thử lại nha 💗"}};o.append(b)})}
$$("[data-move]").forEach(b=>b.onclick=()=>{const m={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[b.dataset.move];moveMaze(...m)});
document.addEventListener("keydown",e=>{const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(m){e.preventDefault();moveMaze(...m)}});
$("#mazeHint").onclick=()=>toast("Đi theo những ô sáng màu kem nhé! Chạm củ cà rốt để trả lời câu hỏi 🥕");
// Photo puzzle: 4x4 tile arrangement. Each tile displays one quadrant of a 2x2 crop pattern repeated for a fun, solvable picture puzzle.
let puzzleOrder=[],selectedTile=null,puzzleDone=false;
function shuffle(arr){for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function initPuzzle(){puzzleOrder=shuffle(Array.from({length:16},(_,i)=>i));if(puzzleOrder.every((v,i)=>v===i))[puzzleOrder[0],puzzleOrder[1]]=[puzzleOrder[1],puzzleOrder[0]];selectedTile=null;puzzleDone=false;$("#dateQuiz").classList.add("hidden");renderPuzzle()}
function renderPuzzle(){const board=$("#puzzleBoard");board.innerHTML="";puzzleOrder.forEach((v,pos)=>{const b=document.createElement("button");b.className="puzzle-tile"+(selectedTile===pos?" selected":"");b.dataset.n=pos+1;const img=v<8?"assets/hedgehog.jpg":"assets/bunny.jpg";const tile=v%8;const x=(tile%4)/3*100,y=(Math.floor(tile/4)%2)*100;b.style.backgroundImage=`url("${img}")`;b.style.backgroundSize="400% 200%";b.style.backgroundPosition=`${x}% ${y}%`;b.setAttribute("aria-label",`Mảnh ghép ${pos+1}`);b.onclick=()=>clickTile(pos);board.append(b)})}
function clickTile(pos){if(puzzleDone)return;if(selectedTile===null){selectedTile=pos;renderPuzzle();return}if(selectedTile===pos){selectedTile=null;renderPuzzle();return}[puzzleOrder[selectedTile],puzzleOrder[pos]]=[puzzleOrder[pos],puzzleOrder[selectedTile]];selectedTile=null;renderPuzzle();if(puzzleOrder.every((v,i)=>v===i)){puzzleDone=true;confetti();toast("Ghép hoàn thành rồi, giỏi quá anh iu! 💗");setTimeout(()=>$("#dateQuiz").classList.remove("hidden"),600)}}
$("#shufflePuzzle").onclick=initPuzzle;
$$("[data-date]").forEach(b=>b.onclick=()=>{if(b.dataset.date==="21/2/2026"){b.classList.add("correct");$("#dateFeedback").textContent="Đúng rùi! 21/02/2026 là một kỷ niệm thật đáng yêu của chúng mình 💗";setTimeout(()=>next("memory"),1400)}else{$$("#dateQuiz button").forEach(x=>x.classList.remove("wrong"));b.classList.add("wrong");$("#dateFeedback").textContent="Anh thử nhớ lại một chút nhaaa 🐰💕"}});
initPuzzle();
// Memory match
const memoryEmojis=["🦔","🐰","🐟","♑","2317"];
let deck=[],flipped=[],matched=0,lockMemory=false;
function initMemory(){deck=shuffle([...memoryEmojis,...memoryEmojis].map((symbol,id)=>({symbol,pair:symbol,matched:false,id})));flipped=[];matched=0;lockMemory=false;$("#heartHunt").classList.add("hidden");renderMemory();$("#memoryStatus").textContent="Đã tìm được 0/5 cặp"}
function renderMemory(){const board=$("#memoryBoard");board.innerHTML="";deck.forEach((v,i)=>{const b=document.createElement("button");b.className="memory-card"+((flipped.includes(i)||v.matched)?" flipped":"")+(v.matched?" matched":"");b.textContent=(flipped.includes(i)||v.matched)?v.symbol:"?";b.onclick=()=>flipMemory(i);board.append(b)})}
function flipMemory(i){if(lockMemory||flipped.includes(i)||deck[i] && deck[i].matched)return;flipped.push(i);renderMemory();if(flipped.length===2){const [a,b]=flipped;if(deck[a].pair===deck[b].pair){deck[a].matched=true;deck[b].matched=true;matched++;flipped=[];renderMemory();$("#memoryStatus").textContent=`Đã tìm được ${matched}/5 cặp`;if(matched===5){toast("Anh tìm đủ 5 cặp rồi! Mở Heart Hunt nhé 💗");setTimeout(()=>{startHeartHunt();$("#heartHunt").classList.remove("hidden")},700)}}else{lockMemory=true;setTimeout(()=>{flipped=[];lockMemory=false;renderMemory()},750)}}}
initMemory();
// Heart collection and matching
let collected=0,heartCorrect=[1,6];
function startHeartHunt(){collected=0;$("#heartFeedback").textContent="";$("#heartPieces").classList.add("hidden");renderHeartCollection()}
function renderHeartCollection(){const c=$("#heartCollection");c.innerHTML="";for(let i=0;i<10;i++){const b=document.createElement("button");b.className="collect-heart";b.textContent=i<collected?"💖":"♡";b.onclick=()=>{if(i<collected)return;collected++;renderHeartCollection();$("#heartFeedback").textContent=`Đã thu thập ${collected}/10 trái tim 💗`;if(collected===10){$("#heartFeedback").textContent="Đủ 10 trái tim rồi! Tìm hai nửa khớp nhau nhé.";$("#heartPieces").classList.remove("hidden");renderHeartPieces()}};c.append(b)}}
function renderHeartPieces(){const c=$("#heartPieces");c.innerHTML="";const pieces=shuffle(["◀️💗","💗▶️","💔","💖","💘","💕","💝","💓"]);pieces.forEach((p,i)=>{const b=document.createElement("button");b.className="heart-piece";b.textContent=p;b.onclick=()=>{if(i===heartCorrect[0]||i===heartCorrect[1]){};const chosen=$$(".heart-piece.selected");if(chosen.length===0){b.classList.add("selected");b.style.outline="3px solid #e98fa9"}else{const first=chosen[0];if(first===b){b.classList.remove("selected");b.style.outline="";return}if((first.textContent==="◀️💗"&&p==="💗▶️")||(first.textContent==="💗▶️"&&p==="◀️💗")){b.style.background="#e8f4e2";first.style.background="#e8f4e2";$("#heartFeedback").textContent="Hai nửa trái tim đã tìm thấy nhau — giống như chúng mình! 💗";setTimeout(()=>next("letter"),1300)}else{first.classList.remove("selected");first.style.outline="";b.style.outline="";$("#heartFeedback").textContent="Hai mảnh này chưa khớp rồi, anh thử tiếp nhé!"}}};c.append(b)})}
// Letter
$("#envelope").onclick=()=>{$("#loveLetter").classList.remove("hidden");$("#envelope").classList.add("hidden");confetti();toast("Một lời nhắn nhỏ dành riêng cho anh 💌");setTimeout(()=>next("music"),7000)};
// Music choices
const hisSongNames=["Mình anh thôi","Để dành cho em","Anh đã ổn hơn","Va vào giai điệu này","Chìm sâu","Vạn vật như muốn ta bên nhau","Nơi ta chờ em","Để tôi ôm em bằng giai điệu này","Nếu như ta chẳng còn","Từng ngày yêu em","Miên man","Chờ anh nhé"];
function makeSongs(container,names,onPick){const el=$(container);el.innerHTML="";names.forEach((name,i)=>{const b=document.createElement("button");b.className="song-btn";b.innerHTML=`<span>${i+1}</span><div>${name}</div>`;b.onclick=()=>{el.querySelectorAll("button").forEach(x=>x.classList.remove("chosen"));b.classList.add("chosen");onPick(name,b)};el.append(b)})}
makeSongs("#hisSongs",hisSongNames,name=>{$("#hisSongFeedback").textContent=`Anh chọn “${name}” rồi nè. Bài anh thích nhất hiện tại là bài gì? Có nằm trong danh sách này không nè, nói em nghe nhé! 💗`});
makeSongs("#herSongs",["Cơn mưa tình yêu","Năm mươi năm về sau","Người đặc biệt","Take me to your heart"],(name,b)=>{if(name==="Năm mươi năm về sau"){b.classList.add("chosen");$("#herSongFeedback").textContent="Đúng rùi đó anh iu! 🥹💗 Anh nhớ giỏi quá. Bài em thích nhất là “Năm mươi năm về sau”." ;setTimeout(()=>next("galaxy"),1800)}else{$("#herSongFeedback").textContent="Chưa đúng rùi, anh thử đoán thêm lần nữa nha 🐰💕"}});
// Letters
const letters=[
"Khoảng cách khiến chúng mình không thể gặp nhau mỗi khi muốn, nhưng em hy vọng chúng mình vẫn sẽ có nhau như vậy, chỉ giản đơn vậy thôi.",
"Anh đừng suy nghĩ nhiều nhé. Tình cảm em dành cho anh là thật và em cần nhiều thời gian hơn để “thích nghi” thui. Yêu anh nhiều lắm đó nha :3",
"Em không biết tương lai sẽ có những điều gì chờ đợi chúng mình, nhưng em mong cả hai sẽ luôn cố gắng để trở thành những phiên bản tốt hơn của chính mình. Em muốn được nhìn thấy anh trưởng thành, hạnh phúc và sống cuộc đời mà anh tự hào. Và em hy vọng mình cũng vậy. Yêu anh. 💗",
"Hôm nay thế nào cũng được, miễn là anh đã cố gắng và vẫn chăm sóc tốt cho bản thân. Ngủ ngon nhé, chàng trai của em. ❤️",
"Có thể em không hiểu hết những khó khăn anh đang trải qua, nhưng em biết anh đang cố gắng. Em tin anh và muốn đồng hành cùng anh 🐰💕🦔",
"Anh nè, hôm nay anh đã vất vả rồi. Đừng ép bản thân phải làm mọi thứ thật hoàn hảo nhé. Nghỉ ngơi một chút cũng là cách để tiếp tục tiến về phía trước. Em mong anh luôn khỏe mạnh và bình an.",
"Em rất trân trọng việc anh nghiêm túc với những điều mình đã lựa chọn. Sự trách nhiệm ấy khiến em cảm thấy anh là người đáng để tin tưởng và tôn trọng.",
"Em thích nụ cười của anh lắm. Nó dễ thương á. Có những lúc chỉ cần nhìn thấy anh cười thôi là tâm trạng em cũng tốt lên theo nè.",
"Em chỉ muốn bên anh thôi 💕🦔"
];
let openedLetters=new Set();
$$("[data-letter]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.letter);openedLetters.add(n);$("#planetProgress").textContent=`Đã mở ${openedLetters.size}/9 bức thư`;const paper=$("#planetLetter");paper.classList.remove("hidden");paper.innerHTML=`<div class="letter-top">Dear anh iu dấu,</div><p>${letters[n]}</p><div class="letter-sign">Thương anh nhiều,<br><span>Thỏ 🐰</span></div>`;paper.scrollIntoView({behavior:"smooth",block:"center"});if(openedLetters.size===9){setTimeout(()=>{const end=document.createElement("button");end.className="primary";end.textContent="Đọc lời nhắn cuối cùng 💗";end.onclick=()=>next("ending");if(!paper.querySelector("button"))paper.append(end)},300)}});
$("#musicToggle").onclick=()=>{const b=$("#musicToggle");const on=b.dataset.on==="1";b.dataset.on=on?"0":"1";b.textContent=on?"♫ Nhạc: tắt":"♫ Nhạc: bật";toast(on?"Đã tắt nhạc nền.":"Bản này chưa đính kèm file nhạc để tránh tự phát nhạc có bản quyền. Em có thể thêm file nhạc của mình vào thư mục assets.");
};
