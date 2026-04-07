import { CodePreset } from '@/types';

export const typingPresets: CodePreset[] = [
  {
    id: 't1', name: 'Hello World', difficulty: 'beginner',
    code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  },
  {
    id: 't2', name: '变量声明', difficulty: 'beginner',
    code: 'int age = 20;\nfloat score = 95.5;\nchar grade = \'A\';\nprintf("Age: %d\\n", age);',
  },
  {
    id: 't3', name: '条件判断', difficulty: 'basic',
    code: 'if (score >= 90) {\n    printf("Excellent!\\n");\n} else if (score >= 60) {\n    printf("Good!\\n");\n} else {\n    printf("Failed!\\n");\n}',
  },
  {
    id: 't4', name: 'For循环', difficulty: 'basic',
    code: 'for (int i = 0; i < 10; i++) {\n    printf("%d ", i);\n}',
  },
  {
    id: 't5', name: 'While循环', difficulty: 'basic',
    code: 'int i = 1;\nint sum = 0;\nwhile (i <= 100) {\n    sum += i;\n    i++;\n}\nprintf("Sum = %d\\n", sum);',
  },
  {
    id: 't6', name: '数组操作', difficulty: 'intermediate',
    code: 'int arr[] = {5, 3, 8, 1, 9};\nint n = sizeof(arr) / sizeof(arr[0]);\nfor (int i = 0; i < n - 1; i++) {\n    for (int j = 0; j < n - i - 1; j++) {\n        if (arr[j] > arr[j + 1]) {\n            int temp = arr[j];\n            arr[j] = arr[j + 1];\n            arr[j + 1] = temp;\n        }\n    }\n}',
  },
  {
    id: 't7', name: '指针基础', difficulty: 'intermediate',
    code: 'int a = 42;\nint *p = &a;\nprintf("Value: %d\\n", *p);\nprintf("Address: %p\\n", (void *)p);\n*p = 100;\nprintf("New value: %d\\n", a);',
  },
  {
    id: 't8', name: '结构体', difficulty: 'intermediate',
    code: 'typedef struct {\n    char name[50];\n    int age;\n    float score;\n} Student;\n\nStudent s = {"Tom", 20, 95.5};\nprintf("%s: %d, %.1f\\n", s.name, s.age, s.score);',
  },
  {
    id: 't9', name: '函数定义', difficulty: 'basic',
    code: 'int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    printf("5! = %d\\n", factorial(5));\n    return 0;\n}',
  },
  {
    id: 't10', name: '冒泡排序', difficulty: 'advanced',
    code: 'void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        int swapped = 0;\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n                swapped = 1;\n            }\n        }\n        if (!swapped) break;\n    }\n}',
  },
  {
    id: 't11', name: '链表节点', difficulty: 'advanced',
    code: 'typedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nNode* createNode(int data) {\n    Node *newNode = (Node*)malloc(sizeof(Node));\n    newNode->data = data;\n    newNode->next = NULL;\n    return newNode;\n}',
  },
  {
    id: 't12', name: '文件操作', difficulty: 'advanced',
    code: 'FILE *fp = fopen("data.txt", "w");\nif (fp == NULL) {\n    printf("Failed to open file\\n");\n    return 1;\n}\nfprintf(fp, "Hello, File!\\n");\nfclose(fp);',
  },
];
