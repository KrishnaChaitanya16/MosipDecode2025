export const englishFields = [
  { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter full name' },
  { id: 'age', label: 'Age', type: 'number', placeholder: 'Enter age' },
  { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { id: 'dob', label: 'Date of Birth', type: 'text', placeholder: 'YYYY-MM-DD' },
  { id: 'address', label: 'Address', type: 'text', placeholder: 'Enter address' },
  { id: 'country', label: 'Country', type: 'text', placeholder: 'Enter country' },
  { id: 'phone', label: 'Phone', type: 'tel', placeholder: 'Enter phone number' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' },
  { id: 'id_number', label: 'ID Number', type: 'text', placeholder: 'Enter ID number' }
];

export const chineseFields = [
  { id: 'name', label: '姓名 (Name)', type: 'text', placeholder: '输入姓名' },
  { id: 'age', label: '年龄 (Age)', type: 'number', placeholder: '输入年龄' },
  { id: 'gender', label: '性别 (Gender)', type: 'select', options: ['男', '女', '其他'] },
  { id: 'dob', label: '出生日期 (DOB)', type: 'text', placeholder: 'YYYY-MM-DD' },
  { id: 'address', label: '地址 (Address)', type: 'text', placeholder: '输入地址' },
  { id: 'country', label: '国家 (Country)', type: 'text', placeholder: '输入国家' },
  { id: 'phone', label: '电话 (Phone)', type: 'tel', placeholder: '输入电话' },
  { id: 'email', label: '邮箱 (Email)', type: 'email', placeholder: '输入邮箱' },
  { id: 'id_number', label: '证件号码 (ID)', type: 'text', placeholder: '输入证件号码' }
];

export const japaneseFields = [
    { id: 'name', label: '氏名 (Name)', type: 'text', placeholder: '氏名を入力' },
    { id: 'age', label: '年齢 (Age)', type: 'number', placeholder: '年齢を入力' },
    { id: 'gender', label: '性別 (Gender)', type: 'select', options: ['男性', '女性', 'その他'] },
    { id: 'dob', label: '生年月日 (DOB)', type: 'text', placeholder: 'YYYY-MM-DD' },
    { id: 'address', label: '住所 (Address)', type: 'text', placeholder: '住所を入力' },
    { id: 'country', label: '国籍 (Country)', type: 'text', placeholder: '国籍を入力' },
    { id: 'phone', label: '電話番号 (Phone)', type: 'tel', placeholder: '電話番号を入力' },
    { id: 'email', label: 'メールアドレス (Email)', type: 'email', placeholder: 'メールアドレスを入力' },
    { id: 'id_number', label: 'ID番号 (ID)', type: 'text', placeholder: 'ID番号を入力' }
];

export const koreanFields = [
    { id: 'name', label: '이름 (Name)', type: 'text', placeholder: '이름 입력' },
    { id: 'age', label: '나이 (Age)', type: 'number', placeholder: '나이 입력' },
    { id: 'gender', label: '성별 (Gender)', type: 'select', options: ['남성', '여성', '기타'] },
    { id: 'dob', label: '생년월일 (DOB)', type: 'text', placeholder: 'YYYY-MM-DD' },
    { id: 'address', label: '주소 (Address)', type: 'text', placeholder: '주소 입력' },
    { id: 'country', label: '국가 (Country)', type: 'text', placeholder: '국가 입력' },
    { id: 'phone', label: '전화번호 (Phone)', type: 'tel', placeholder: '전화번호 입력' },
    { id: 'email', label: '이메일 (Email)', type: 'email', placeholder: '이메일 입력' },
    { id: 'id_number', label: 'ID 번호 (ID)', type: 'text', placeholder: 'ID 번호 입력' }
];


export const templates = {
    en: { name: "English", fields: englishFields, langCode: 'en' },
    ch: { name: "中文 (Chinese)", fields: chineseFields, langCode: 'ch' },
    ja: { name: "日本語 (Japanese)", fields: japaneseFields, langCode: 'ja' },
    ko: { name: "한국어 (Korean)", fields: koreanFields, langCode: 'ko' }
};
