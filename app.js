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
    };

    if (!data.gender || !data.goal) {
      alert("성별과 목표를 선택해주세요.");
      return;
    }

    const prompt = `
당신은 대한민국 최고의 퍼스널 트레이너이자 영양사입니다. 아래 사용자 정보를 바탕으로 실전에서 바로 쓸 수 있는 맞춤 식단 + 운동 플랜을 작성해주세요.

[사용자 정보]
- 성별: ${data.gender}
- 나이: ${data.age}세
- 키: ${data.height}cm
- 현재 몸무게: ${data.weight}kg
- 목표 몸무게: ${data.targetWeight}kg
- 운동 목표: ${data.goal}
- 목표 기간: ${data.period}
- 활동 수준: ${data.activity}
- 못 먹는 음식 / 알레르기: ${data.dislike}

아래 JSON 형식으로만 응답해주세요. JSON 외에 다른 텍스트는 절대 쓰지 마세요.

{
  "analysis": {
    "bmi": "숫자만 (소수점 1자리)",
    "status": "저체중/정상/과체중/비만 중 하나",
    "dailyCalorie": "숫자만 (TDEE 기반 유지 칼로리)",
    "targetCalorie": "숫자만 (목표 달성용 칼로리)",
    "protein": "숫자만 (g)",
    "carb": "숫자만 (g)",
    "fat": "숫자만 (g)"
  },
  "meals": {
    "breakfast": "아침 메뉴 (칼로리 포함, 한국 음식 위주)",
    "lunch": "점심 메뉴 (칼로리 포함, 한국 음식 위주)",
    "dinner": "저녁 메뉴 (칼로리 포함, 한국 음식 위주)",
    "snack": "간식 메뉴 (칼로리 포함)"
  },
  "workout": {
    "weekly": "주 몇 회 운동 권장 (예: 주 4회)",
    "cardio": "유산소 운동 종류와 시간/강도 (예: 런닝머신 30분 시속 6km, 또는 천국의 계단 20분 중강도 등 목표에 맞게 구체적으로)",
    "weight": "웨이트 운동 구성 (예: 스쿼트 4세트 12회, 데드리프트 3세트 10회 등 목표에 맞게 구체적으로)",
    "rest": "휴식일 추천 및 회복 방법"
  },
  "weeklyPlan": [
    {"day": "월", "focus": "운동 종류", "cardio": "유산소 내용", "weight": "웨이트 내용"},
    {"day": "화", "focus": "운동 종류", "cardio": "유산소 내용", "weight": "웨이트 내용"},
    {"day": "수", "focus": "휴식 or 운동", "cardio": "-", "weight": "-"},
    {"day": "목", "focus": "운동 종류", "cardio": "유산소 내용", "weight": "웨이트 내용"},
    {"day": "금", "focus": "운동 종류", "cardio": "유산소 내용", "weight": "웨이트 내용"},
    {"day": "토", "focus": "운동 종류", "cardio": "유산소 내용", "weight": "웨이트 내용"},
    {"day": "일", "focus": "휴식", "cardio": "-", "weight": "-"}
  ],
  "tips": ["팁1", "팁2", "팁3"],
  "warnings": ["주의사항1", "주의사항2"]
}
    `.trim();

    loading.style.display = "flex";
    resultSection.style.display = "none";

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
      const raw = json.result.trim().replace(/```json|```/g, "").trim();
      const data2 = JSON.parse(raw);

      loading.style.display = "none";
      renderResult(data2);
      resultSection.style.display = "block";
      resultSection.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      loading.style.display = "none";
      alert("오류: " + err.message);
    }
  });
}

function renderResult(d) {
  const a = d.analysis;
  const m = d.meals;
  const w = d.workout;

  resultContent.innerHTML = `
    <!-- 기본 분석 -->
    <div class="result-card">
      <div class="rc-title">📊 기본 분석</div>
      <div class="rc-stats">
        <div class="rc-stat">
          <span class="rc-stat-num">${a.bmi}</span>
          <span class="rc-stat-label">BMI</span>
          <span class="rc-stat-tag">${a.status}</span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-num">${Number(a.targetCalorie).toLocaleString()}</span>
          <span class="rc-stat-label">목표 칼로리 (kcal)</span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-num">${a.protein}g</span>
          <span class="rc-stat-label">단백질</span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-num">${a.carb}g</span>
          <span class="rc-stat-label">탄수화물</span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-num">${a.fat}g</span>
          <span class="rc-stat-label">지방</span>
        </div>
      </div>
    </div>

    <!-- 식단 플랜 -->
    <div class="result-card">
      <div class="rc-title">🍽️ 하루 식단 플랜</div>
      <div class="rc-meals">
        <div class="rc-meal"><span class="meal-time">아침</span><span class="meal-content">${m.breakfast}</span></div>
        <div class="rc-meal"><span class="meal-time">점심</span><span class="meal-content">${m.lunch}</span></div>
        <div class="rc-meal"><span class="meal-time">저녁</span><span class="meal-content">${m.dinner}</span></div>
        <div class="rc-meal"><span class="meal-time">간식</span><span class="meal-content">${m.snack}</span></div>
      </div>
    </div>

    <!-- 운동 플랜 -->
    <div class="result-card">
      <div class="rc-title">💪 운동 플랜</div>
      <div class="rc-workout">
        <div class="rc-wo-item"><span class="wo-label">📅 주간 빈도</span><span class="wo-val">${w.weekly}</span></div>
        <div class="rc-wo-item"><span class="wo-label">🏃 유산소</span><span class="wo-val">${w.cardio}</span></div>
        <div class="rc-wo-item"><span class="wo-label">🏋️ 웨이트</span><span class="wo-val">${w.weight}</span></div>
        <div class="rc-wo-item"><span class="wo-label">😴 회복</span><span class="wo-val">${w.rest}</span></div>
      </div>
    </div>

    <!-- 주간 스케줄 -->
    <div class="result-card">
      <div class="rc-title">📅 주간 운동 스케줄</div>
      <div class="rc-week">
        ${d.weeklyPlan.map(day => `
          <div class="rc-day ${day.focus === '휴식' ? 'rest-day' : ''}">
            <div class="day-name">${day.day}</div>
            <div class="day-focus">${day.focus}</div>
            ${day.cardio !== '-' ? `<div class="day-detail">🏃 ${day.cardio}</div>` : ''}
            ${day.weight !== '-' ? `<div class="day-detail">🏋️ ${day.weight}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 팁 & 주의사항 -->
    <div class="result-two-col">
      <div class="result-card">
        <div class="rc-title">💡 핵심 전략</div>
        <ul class="rc-list">
          ${d.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
      <div class="result-card">
        <div class="rc-title">⚠️ 주의사항</div>
        <ul class="rc-list warning">
          ${d.warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function resetForm() {
  if (form) form.reset();
  if (resultSection) resultSection.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
