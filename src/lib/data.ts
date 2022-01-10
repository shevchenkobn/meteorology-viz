import camelcase from 'camelcase';
import { parse, ParseResult } from 'papaparse';
import { whenT } from './expressions';

export interface CsvParseConfig<T = Record<string, any>> {
  parseFieldsAs: {
    int?: Iterable<keyof T>;
    float?: Iterable<keyof T>;
  };
}

export function parseCsv<T = Record<string, any>>(csvText: string, config?: CsvParseConfig<T>): ParseResult<T> {
  const parseConfig: Parameters<typeof parse>[1] = {
    header: true,
    transformHeader(value: string, index: number): string {
      return camelcase(value);
    },
    skipEmptyLines: true,
  };
  if (config?.parseFieldsAs?.int || config?.parseFieldsAs?.float) {
    const intFieldSet = new Set(config?.parseFieldsAs?.int);
    const floatFieldSet = new Set(config?.parseFieldsAs?.float);
    parseConfig.transform = (value, rawField) => {
      const field = rawField.toString() as keyof T;
      return whenT<any>(
        [
          [intFieldSet.has(field), () => Number.parseInt(value)],
          [floatFieldSet.has(field), () => Number.parseFloat(value)],
        ],
        () => value
      );
    };
  }
  return parse(csvText, parseConfig);
}

export const storeLocalStorageKey = '__storeState__';
