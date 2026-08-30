export type NavLink = {
  label: string;
  href: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  items: FaqItem[];
};
