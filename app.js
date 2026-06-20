const form = document.getElementById("planfit-form");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("result-section");
const resultContent = document.getElementById("result-content");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      gender: form.querySelector('input[name="gender"]:checked')?.value,
      age: form.age.value,
      height: form.height.value,
      weight: form.weight.value,
      goal: form.querySelector('input[name="goal"]:checked')?.value,
      targetWeight: form.targetWeight.value,
      period: form.period.value,
      dislike: form.dislike.value || "없음",
      activity: form.activity.value,
      budget: form.budget.value,
      occupation: form.occupation.value,
      experience: form.experience.value,
    };

    if (!data.gender || !data.goal) {
      alert("성별과 목표를 선택해주세요.");
      return;
    }

    const prompt = `
당신은 대한민국 최고의 퍼스널 트레이너이자 영양사입니다.
아래 사용자 정보를 바탕으로 실전 맞춤 식단 + 운동 플랜을 작성해주세요.

[사용자 정보]
- 성별: ${data.gender} / 나이: ${data.age}세 / 키: ${data.height}cm / 현재 몸무게: ${data.weight}kg
- 목표 몸무게: ${data.targetWeight}kg / 목표: ${data.goal} / 기간: ${data.period}
- 활동 수준: ${data.activity}
- 못 먹는 음식: ${data.dislike}
- 하루 식비 예산: ${data.budget}
- 직업/생활패턴: ${data.occupation}
- 운동 경력: ${data.experience}

아래 형식으로 작성해주세요. 각 섹션은 ## 제목으로 구분하고, 핵심만 간결하게 작성하세요.

## 📊 기본 분석
- **BMI**: (계산값) — (상태)
- **유지 칼로리**: kcal / **목표 칼로리**: kcal
- **단백질**: g / **탄수화물**: g / **지방**: g

## 🍽️ 하루 식단 플랜
| 시간 | 메뉴 | 칼로리 |
|------|------|--------|
| 아침 | ... | ...kcal |
| 점심 | ... | ...kcal |
| 저녁 | ... | ...kcal |
| 간식 | ... | ...kcal |

## 💪 운동 플랜
- **주간 빈도**: 주 N회
- **유산소**: (종류, 시간, 강도 — 목표에 맞게 구체적으로)
- **웨이트**: (주요 운동, 세트×횟수)

## 📅 주간 스케줄
| 요일 | 운동 | 유산소 | 웨이트 |
|------|------|--------|--------|
| 월 | ... | ... | ... |
| 화 | ... | ... | ... |
| 수 | 휴식 | - | - |
| 목 | ... | ... | ... |
| 금 | ... | ... | ... |
| 토 | ... | ... | ... |
| 일 | 휴식 | - | - |

## 💡 핵심 전략
1. ...
2. ...
3. ...

## 💊 보충제 추천
| 보충제 | 목적 | 복용 타이밍 | 우선순위 |
|--------|------|------------|---------|
| ... | ... | ... | 필수/선택 |

## 📈 주차별 변화 플랜
| 주차 | 칼로리 | 운동 강도 | 목표 체중 | 포인트 |
|------|--------|---------|---------|--------|
| 1~2주 | ... | ... | ...kg | ... |
| 3~4주 | ... | ... | ...kg | ... |

## 🔄 정체기 대처법
1. ...
2. ...
3. ...

## ⚠️ 주의사항
1. ...
2. ...
    `.trim();

    loading.style.display = "flex";
    resultSection.style.display = "none";
    startLoadingAnimation();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "오류가 발생했습니다.");
      }

      const json = await res.json();

      stopLoadingAnimation(true);
      setTimeout(() => {
        loading.style.display = "none";
        resultContent.innerHTML = marked.parse(json.result);
        resultSection.style.display = "block";
        resultSection.scrollIntoView({ behavior: "smooth" });
      }, 600);

    } catch (err) {
      stopLoadingAnimation(false);
      loading.style.display = "none";
      alert("오류: " + err.message);
    }
  });
}

/* ── 로딩 애니메이션 ── */
let _loadingTimer = null;

function startLoadingAnimation() {
  const steps = [
    { pct: 8,  msg: "📋 신체 정보 분석 중..." },
    { pct: 20, msg: "🔥 칼로리 계산 중..." },
    { pct: 35, msg: "🍽️ 맞춤 식단 구성 중..." },
    { pct: 50, msg: "💪 운동 루틴 작성 중..." },
    { pct: 63, msg: "📅 주간 스케줄 설계 중..." },
    { pct: 75, msg: "💊 보충제 추천 분석 중..." },
    { pct: 85, msg: "📈 주차별 변화 플랜 생성 중..." },
    { pct: 93, msg: "🔄 정체기 대처 전략 수립 중..." },
    { pct: 98, msg: "✅ 마무리 검토 중..." },
  ];

  const msgEl  = document.getElementById("loading-msg");
  const barEl  = document.getElementById("progress-bar");
  const pctEl  = document.getElementById("progress-pct");

  let i = 0;
  const intervals = [800, 1200, 1500, 1800, 1400, 1600, 1500, 1400, 99999];

  function next() {
    if (i >= steps.length) return;
    const s = steps[i];
    msgEl.style.opacity = 0;
    setTimeout(() => {
      msgEl.textContent = s.msg;
      msgEl.style.opacity = 1;
    }, 150);
    barEl.style.width = s.pct + "%";
    pctEl.textContent = s.pct + "%";
    i++;
    _loadingTimer = setTimeout(next, intervals[i - 1]);
  }

  next();
}

function stopLoadingAnimation(success) {
  clearTimeout(_loadingTimer);
  const msgEl = document.getElementById("loading-msg");
  const barEl  = document.getElementById("progress-bar");
  const pctEl  = document.getElementById("progress-pct");
  if (success) {
    barEl.style.width = "100%";
    pctEl.textContent = "100%";
    msgEl.textContent = "🎉 플랜 완성!";
  }
}

function resetForm() {
  if (form) form.reset();
  if (resultSection) resultSection.style.display = "none";
  resetFeedback();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── 피드백 ── */
let selectedScore = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".rating-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedScore = parseInt(btn.dataset.score);
      document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
});

async function submitFeedback() {
  const text = document.getElementById("feedback-text").value.trim();
  const submitBtn = document.getElementById("feedback-submit");

  if (!selectedScore) {
    alert("만족도를 선택해주세요 😊");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "전송 중...";

  const scoreLabels = { 1: "😞 별로", 2: "😐 보통", 3: "🙂 괜찮아요", 4: "😊 좋아요", 5: "🔥 최고예요" };

  try {
    await fetch("https://formspree.io/f/meewepje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        만족도: scoreLabels[selectedScore],
        의견: text || "(없음)",
      }),
    });
  } catch (_) {}

  submitBtn.style.display = "none";
  document.getElementById("feedback-done").style.display = "block";
}

function resetFeedback() {
  selectedScore = 0;
  const text = document.getElementById("feedback-text");
  const done = document.getElementById("feedback-done");
  const submitBtn = document.getElementById("feedback-submit");
  if (text) text.value = "";
  if (done) done.style.display = "none";
  if (submitBtn) { submitBtn.style.display = "inline-block"; submitBtn.disabled = false; submitBtn.textContent = "피드백 보내기"; }
  document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("selected"));
}
