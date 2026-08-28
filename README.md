# QR 스캔 → MS Forms 전송 앱

핸드폰 홈 화면에 설치해서 쓰는 웹앱입니다. 화면 상단은 카메라로 QR코드를 스캔하고,
하단에서 구분 버튼/비고를 선택·입력한 뒤 "MS Forms로 전송"을 누르면 Microsoft Forms의
**미리 채워진 링크(Pre-filled link)** 로 값이 채워진 채 폼이 열립니다.

## 파일 구성

```
qr-msforms-app/
├── index.html      ← 실제 앱 (설정은 이 파일 상단 CONFIG 블록에서 함)
├── manifest.json   ← 홈 화면 추가(PWA) 설정
├── sw.js           ← 서비스 워커 (설치 조건 충족 + 기본 캐싱)
├── vercel.json     ← Vercel 배포 헤더 설정
└── icons/          ← 앱 아이콘
```

---

## 1단계. Microsoft Forms에서 "미리 채워진 링크" 만들기

1. 값을 전달받을 Microsoft Forms를 엽니다.
2. 폼 상단에서 **"미리 채워진 답변 사용"(Enable pre-filled answers)** 옵션을 켭니다. (이 옵션이 꺼져 있으면 링크 생성 메뉴 자체가 동작하지 않습니다.)
3. 우측 상단 **"…"(기타 옵션)** 메뉴 → **"미리 채워진 링크 가져오기"(Get Pre-filled link)** 를 클릭합니다.
4. QR 값을 받을 문항, 구분(버튼) 값을 받을 문항, 비고(텍스트) 값을 받을 문항 — 이렇게 3개 문항에 각각 아래 문자열을 **그대로** 입력합니다. (실제 값이 아니라 나중에 코드가 자동으로 바꿔치기할 "표식"입니다.)
   - QR 값 문항 → `QR_VALUE_HERE`
   - 구분 버튼 문항 → `BUTTON_VALUE_HERE`
   - 비고 문항 → `TEXT_VALUE_HERE`
5. **"미리 채워진 링크 가져오기"** 버튼을 눌러 URL을 복사합니다.
   - 이 URL은 `https://forms.office.com/pages/responsepage.aspx?id=...&r1abc=QR_VALUE_HERE&r2def=BUTTON_VALUE_HERE&r3ghi=TEXT_VALUE_HERE` 같은 형태입니다. 파라미터 이름(`r1abc` 등)은 폼마다 다르게 자동 생성되는데, 이 값을 몰라도 되도록 위 3단계에서 넣은 표식 문자열을 그대로 찾아 바꾸는 방식으로 만들었습니다.

> ⚠️ 참고: 이 미리 채움 기능은 **텍스트형·객관식 문항**에서 안정적으로 동작합니다. 평점, 순위, 파일 업로드 문항에는 사용하지 마세요.
> ⚠️ Microsoft Forms는 URL만으로 "제출"까지 자동으로 하는 기능은 제공하지 않습니다. 이 앱은 값이 채워진 폼 화면까지 열어주고, 마지막 **제출 버튼은 사용자가 직접 한 번** 눌러야 합니다.

## 2단계. index.html 설정 채우기

`index.html`을 열어 `CONFIG` 블록을 찾아 수정합니다.

```js
const CONFIG = {
  MS_FORMS_TEMPLATE_URL: "여기에 1단계에서 복사한 URL 붙여넣기",
  ...
  QUICK_BUTTONS: [
    { label: "정상", value: "정상" },
    { label: "이상", value: "이상" },
    { label: "확인필요", value: "확인필요" }
  ],
  REQUIRE_BUTTON: false   // 구분 버튼 선택을 필수로 하려면 true
};
```

- `QUICK_BUTTONS`의 개수·문구·값은 자유롭게 수정/추가/삭제해도 됩니다.
- `OPEN_IN_NEW_TAB`을 `true`로 두면 전송 후 새 탭으로 폼이 열리고 스캐너 화면은 그대로 살아있어 바로 다음 항목을 스캔할 수 있습니다(안드로이드에서 안정적). iOS 홈화면 앱에서 새 탭 전환이 어색하다면 `false`로 바꿔보세요.

## 3단계. Vercel 배포

### 방법 A. Vercel CLI
```bash
npm i -g vercel
cd qr-msforms-app
vercel --prod
```
안내에 따라 로그인하면 배포 URL이 발급됩니다. (별도 빌드 설정 불필요 — 정적 파일 그대로 배포됩니다.)

### 방법 B. Vercel 대시보드
1. 이 폴더를 GitHub 저장소에 올립니다.
2. [vercel.com](https://vercel.com) → **Add New → Project** → 해당 저장소 선택 → Deploy.
   (Framework Preset은 "Other"로 두면 됩니다.)

## 4단계. 홈 화면에 추가

배포된 URL을 모바일 브라우저로 접속합니다. (카메라 권한 때문에 반드시 HTTPS 주소여야 하는데, Vercel은 기본으로 HTTPS를 제공하므로 별도 조치가 필요 없습니다.)

- **안드로이드(Chrome)**: 주소창 옆 메뉴(⋮) → "홈 화면에 추가" 또는 하단에 뜨는 "앱 설치" 배너 사용
- **iOS(Safari)**: 하단 공유 버튼 → "홈 화면에 추가"

다음부터는 홈 화면 아이콘을 눌러 바로 스캔 화면으로 진입합니다.

## 사용 흐름

1. 아이콘 실행 → 상단 카메라 자동 시작
2. QR코드를 프레임에 맞추면 자동 인식 (인식되면 초록 프레임 + 진동)
3. 하단에서 구분 버튼 선택, 필요 시 비고 입력
4. "MS Forms로 전송" 탭 → 값이 채워진 MS Forms 화면에서 제출 버튼 탭
5. 앱은 자동으로 초기화되어 바로 다음 항목 스캔 가능

## 커스터마이징 메모

- 아이콘은 `gen_icons.py`(Python)로 생성했습니다. 색상이나 모양을 바꾸고 싶으면 이 스크립트를 수정 후 다시 실행하면 됩니다.
- 카메라 인식 라이브러리는 CDN(`html5-qrcode`)을 사용하므로 스캔 화면 자체는 네트워크가 필요합니다. 완전한 오프라인 동작용 앱은 아닙니다.
