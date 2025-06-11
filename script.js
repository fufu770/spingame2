// SVG 및 DOM 요소 선택
const wheel = document.getElementById('wheel'); // SVG 원판 요소
const spinBtn = document.getElementById('spinBtn'); // 시작 버튼
const result = document.getElementById('result'); // 결과 표시 영역
const winSound = document.getElementById('winSound'); // 축하 사운드

// 룰렛에 들어갈 항목(섹션) 텍스트
const prizes = [
    '한통 더',
    '10% 할인',
    '두통 더',
    '5% 할인',
    '1+1',
    '꽝, 한번더!'
];

// 각 섹션의 색상 배열
const colors = [
    '#FF6B6B', // 빨강
    '#4ECDC4', // 민트
    '#FFD93D', // 노랑
    '#95E1D3', // 연민트
    '#FF8B94', // 핑크
    '#A8E6CF'  // 연초록
];

// 섹션 개수 및 각도
const sectionCount = prizes.length; // 6
const sectionAngle = 360 / sectionCount; // 60도

// SVG 크기 및 원판 반지름
const size = 500; // SVG viewBox 크기
const center = size / 2; // 중심 좌표
const radius = 220; // 원판 반지름

// 회전 상태 변수
let isSpinning = false; // 회전 중 여부
let currentRotation = 0; // 현재 회전 각도(누적)

// SVG에 원판(부채꼴)과 텍스트를 그리는 함수
drawWheel(); // 최초 1회 실행
function drawWheel() {
    // 기존 내용 초기화
    wheel.innerHTML = '';

    // <g> 그룹 생성 (회전용)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'wheel-group');
    g.setAttribute('filter', 'drop-shadow(0px 8px 24px rgba(0,0,0,0.18))'); // 그림자 효과

    // 6개의 부채꼴(파이 조각)과 텍스트 생성
    for (let i = 0; i < sectionCount; i++) {
        // 각 섹션의 시작/끝 각도(라디안)
        const startAngle = (i * sectionAngle - 90) * Math.PI / 180; // -90도부터 시작(위쪽)
        const endAngle = ((i + 1) * sectionAngle - 90) * Math.PI / 180;

        // 부채꼴 path 좌표 계산
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        // path d 속성(부채꼴)
        const d = [
            `M ${center} ${center}`, // 중심에서 시작
            `L ${x1} ${y1}`,         // 시작점으로 선
            `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`, // 호(arc)
            'Z'                      // 닫기
        ].join(' ');

        // path 요소 생성
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', colors[i]);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '3');
        g.appendChild(path);

        // 텍스트 위치(섹션 중앙 각도)
        const midAngle = ((i + 0.5) * sectionAngle - 90) * Math.PI / 180;
        const textRadius = radius * 0.75; // 텍스트를 각 칸의 중심에 배치
        const tx = center + textRadius * Math.cos(midAngle);
        const ty = center + textRadius * Math.sin(midAngle);

        // 텍스트 요소 생성 (가로쓰기)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('fill', '#222'); // 글자색 검은색
        text.setAttribute('font-size', '22'); // 글자 크기
        text.setAttribute('font-family', 'NexonGothic, sans-serif');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle'); // 가운데 정렬
        text.setAttribute('dominant-baseline', 'middle'); // 수직 중앙 정렬
        text.setAttribute('paint-order', 'stroke');
        text.setAttribute('stroke', 'rgba(255,255,255,0.18)'); // 흰색 그림자 효과
        text.setAttribute('stroke-width', '2');
        // 텍스트를 섹션 중앙 각도에 맞춰 회전 (글자가 항상 가로로 보이도록)
        text.setAttribute('transform', `rotate(${(i * sectionAngle) + sectionAngle/2} ${tx} ${ty})`);

        // 가로쓰기: 한 줄로 텍스트 삽입
        text.textContent = prizes[i];
        g.appendChild(text);
    }

    // 그룹을 SVG에 추가
    wheel.appendChild(g);
}

// SVG 그룹 회전 함수(룰렛 돌리기)
function setWheelRotation(deg) {
    // SVG 그룹(g) 요소를 회전
    const g = document.getElementById('wheel-group');
    g.setAttribute('transform', `rotate(${deg} ${center} ${center})`);
}

// 랜덤 각도 생성 함수(섹션 중앙에 멈추도록)
function getRandomAngle() {
    // 0~5 랜덤 인덱스
    const randomIndex = Math.floor(Math.random() * sectionCount);
    // 섹션 중앙에 멈추는 각도 계산
    const targetAngle = 360 - (randomIndex * sectionAngle + sectionAngle / 2);
    // 5바퀴 추가 회전
    const extraSpins = 360 * 5;
    return { angle: targetAngle + extraSpins, prizeIndex: randomIndex };
}

// 폭죽 효과 함수
function showConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// 결과 표시 함수
function showResult(prize) {
    result.textContent = `축하합니다! ${prize}에 당첨되셨습니다!`;
    result.classList.add('show');
    // 꽝이 아닌 경우에만 효과 재생
    if (prize !== '꽝, 한번더!') {
        winSound.play();
        showConfetti();
    }
}

// 룰렛 회전 함수
function spinWheel() {
    if (isSpinning) return; // 중복 방지
    isSpinning = true;
    spinBtn.disabled = true;
    result.classList.remove('show');
    // 랜덤 각도 및 당첨 인덱스
    const { angle, prizeIndex } = getRandomAngle();
    currentRotation += angle;
    // SVG 그룹 회전 애니메이션 (CSS transition 대신 setTimeout 사용)
    setWheelRotation(currentRotation);
    // 5초 후 결과 표시
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        showResult(prizes[prizeIndex]);
    }, 5000);
}

// 시작 버튼 이벤트 등록
spinBtn.addEventListener('click', spinWheel);

// 페이지 로드시 초기화
window.addEventListener('load', () => {
    winSound.load();
    result.classList.remove('show');
    spinBtn.disabled = false;
    setWheelRotation(currentRotation);
}); 