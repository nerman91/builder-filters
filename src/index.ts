import {
  BooleanFilter,
  DateFilter,
  Filter,
  Message,
  NumberFilter,
  StringFilter
} from './types';

const FILTER_PARAMS = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  or: 'or',
  and: 'and'
} as const;

const STRING_FILTER_PARAMS = {
  equal: 'eq',
  starts_with: 'startsWith',
  ends_with: 'endsWith',
  contains: 'contains'
} as const;

const NUMBER_FILTER_PARAMS = {
  equal: 'eq',
  greater: 'gt',
  less: 'lt',
  greater_to_equal: 'gte',
  less_to_equal: 'lte'
} as const;

const DATE_FILTER_PARAMS = {
  equal: 'eq',
  after: 'after',
  before: 'before'
} as const;

const filterByString = (message: Message, filter: StringFilter): boolean => {
  const messageValue = message[filter.field];

  if (typeof messageValue !== 'string') {
    return false;
  }

  switch (filter.operation) {
    case STRING_FILTER_PARAMS.equal:
      return messageValue === filter.value;
    case STRING_FILTER_PARAMS.starts_with:
      return messageValue.startsWith(filter.value);
    case STRING_FILTER_PARAMS.ends_with:
      return messageValue.endsWith(filter.value);
    case STRING_FILTER_PARAMS.contains:
      return messageValue.includes(filter.value);
    default:
      return false;
  }
};

const filterByNumber = (message: Message, filter: NumberFilter): boolean => {
  const messageValue = message[filter.field];

  if (typeof messageValue !== 'number') {
    return false;
  }

  switch (filter.operation) {
    case NUMBER_FILTER_PARAMS.equal:
      return messageValue === filter.value;
    case NUMBER_FILTER_PARAMS.greater:
      return messageValue > filter.value;
    case NUMBER_FILTER_PARAMS.less:
      return messageValue < filter.value;
    case NUMBER_FILTER_PARAMS.greater_to_equal:
      return messageValue >= filter.value;
    case NUMBER_FILTER_PARAMS.less_to_equal:
      return messageValue <= filter.value;
    default:
      return false;
  }
};

const filterByBoolean = (message: Message, filter: BooleanFilter): boolean => {
  return message[filter.field] === filter.value;
};

const filterByDate = (message: Message, filter: DateFilter): boolean => {
  const messageValue = message[filter.field];
  const filterDate = new Date(filter.value);
  const isDateFormat = messageValue instanceof Date;

  if (!isDateFormat && typeof messageValue !== 'string') {
    return false;
  }

  const messageDate = isDateFormat ? messageValue : new Date(messageValue);

  switch (filter.operation) {
    case DATE_FILTER_PARAMS.equal:
      return messageDate.getTime() === filterDate.getTime();
    case DATE_FILTER_PARAMS.after:
      return messageDate > filterDate;
    case DATE_FILTER_PARAMS.before:
      return messageDate < filterDate;
    default:
      return false;
  }
};

const configureFilter = (message: Message, filter: Filter): boolean => {
  switch (filter.type) {
    case FILTER_PARAMS.string:
      return filterByString(message, filter);
    case FILTER_PARAMS.number:
      return filterByNumber(message, filter);
    case FILTER_PARAMS.boolean:
      return filterByBoolean(message, filter);
    case FILTER_PARAMS.date:
      return filterByDate(message, filter);
    case FILTER_PARAMS.or:
      return filter.filters.some((subFilter) =>
        configureFilter(message, subFilter)
      );
    case FILTER_PARAMS.and:
      return filter.filters.every((subFilter) =>
        configureFilter(message, subFilter)
      );
    default:
      return false;
  }
};

export const filterMessages = (
  messages: Message[],
  filter: Filter
): Message[] => {
  return messages.filter((message) => configureFilter(message, filter));
};
