import fs from 'fs';
import path from 'path';

// Тип одного объекта из JSON
type RawProgram = {
  key: string;
  position: 'обычная' | 'кармическая';
  description: string;
};

// Тип ProgramItem
type ProgramItem = {
  key: string;
  type: 'обычная' | 'кармическая';
  title: string;
};

// Извлекаем title из description
function extractTitle(description: string): string {
  const match = description.match(/Архетип: ([^\n.]+)/);
  return match ? match[1].trim() : 'Без названия';
}

// Основной генератор
function generateProgramKeys(jsonPath: string, outputPath: string) {
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data: RawProgram[] = JSON.parse(raw);

  const programKeys: ProgramItem[] = data
    .filter((item) => item.key && item.position)
    .map((item) => ({
      key: item.key,
      type: item.position,
      title: extractTitle(item.description),
    }));

  const tsOutput =
    'export const programKeys = [\n' +
    programKeys
      .map((p) => `  { key: "${p.key}", type: "${p.type}", title: "${p.title}" }`)
      .join(',\n') +
    '\n];\n';

  fs.writeFileSync(outputPath, tsOutput, 'utf-8');
  console.log(`✅ programKeys сгенерирован в ${outputPath}`);
}

// Запуск
const input = path.resolve('programs.json');
const output = path.resolve('programKeys.generated.ts');

generateProgramKeys(input, output);
