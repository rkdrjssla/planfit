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
당신은 전문 영양사이자 헬스 트레이너입니다. 아래 사용자 정보를 바탕으로 맞춤 식단 플랜을 작성해주세요.

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

아래 형식으로 한국어로 작성해주세요:

📊 기본 분석
- BMI 및 현재 상태 간단 평가
- 하루 권장 칼로리 (TDEE 기반)
- 목표 달성을 위한 칼로리 목표
- 단백질 / 탄수화물 / 지방 비율 (g 단위 포함)

🍽️ 하루 식단 예시 (한국 음식 위주, 현실적으로)
아침 | 점심 | 저녁 | 간식

💡 핵심 식단 전략 (3가지)

⚠️ 주의사항 (2가지)

현실적이고 실천 가능한 한국 음식 중심으로 작성해주세요.
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

      loading.style.display = "none";
      resultContent.textContent = json.result;
      resultSection.style.display = "block";
      resultSection.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      loading.style.display = "none";
      alert("오류: " + err.message);
    }
  });
}

function resetForm() {
  if (form) form.reset();
  if (resultSection) resultSection.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
