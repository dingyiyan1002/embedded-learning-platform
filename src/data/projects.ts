import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: '冒泡排序',
    difficulty: '基础',
    description: '从零实现冒泡排序算法，理解数组操作与嵌套循环',
    tags: ['数组', '排序', '循环'],
    fragments: [
      {
        code: '#include <stdio.h>\n\nvoid bubbleSort(int arr[], int n) {',
        explanation: '引入头文件并定义冒泡排序函数',
      },
      {
        code: '    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {',
        explanation: '外层循环控制趟数，内层循环控制每趟比较次数',
      },
      {
        code: '            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }',
        explanation: '相邻元素比较，如果顺序错误则交换',
        tags: ['变量交换'],
      },
      {
        code: '        }\n    }\n}\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = sizeof(arr) / sizeof(arr[0]);',
        explanation: '结束排序函数，在main中定义测试数组',
      },
      {
        code: '    bubbleSort(arr, n);\n\n    printf("Sorted array: ");\n    for (int i = 0; i < n; i++) {\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n    return 0;\n}',
        explanation: '调用排序函数并输出结果',
      },
    ],
  },
  {
    id: 'proj-2',
    name: '单链表实现',
    difficulty: '进阶',
    description: '实现单链表的创建、插入、删除和遍历操作',
    tags: ['指针', '结构体', '动态内存'],
    fragments: [
      {
        code: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nNode* createNode(int data) {\n    Node *newNode = (Node*)malloc(sizeof(Node));\n    newNode->data = data;\n    newNode->next = NULL;\n    return newNode;\n}',
        explanation: '定义链表节点结构体和创建节点的函数',
      },
      {
        code: 'void insertAtHead(Node **head, int data) {\n    Node *newNode = createNode(data);\n    newNode->next = *head;\n    *head = newNode;\n}',
        explanation: '在链表头部插入新节点（使用二级指针）',
        tags: ['指针', '二级指针'],
      },
      {
        code: 'void printList(Node *head) {\n    Node *current = head;\n    while (current != NULL) {\n        printf("%d -> ", current->data);\n        current = current->next;\n    }\n    printf("NULL\\n");\n}',
        explanation: '遍历并打印链表所有节点',
      },
      {
        code: 'void freeList(Node *head) {\n    Node *current = head;\n    while (current != NULL) {\n        Node *next = current->next;\n        free(current);\n        current = next;\n    }\n}\n\nint main() {\n    Node *head = NULL;\n    insertAtHead(&head, 3);\n    insertAtHead(&head, 2);\n    insertAtHead(&head, 1);\n    printList(head);\n    freeList(head);\n    return 0;\n}',
        explanation: '释放链表内存并在main中测试所有功能',
      },
    ],
  },
  {
    id: 'proj-3',
    name: '学生成绩管理',
    difficulty: '中等',
    description: '使用结构体数组实现学生成绩的录入、查询和统计',
    tags: ['结构体', '数组', '文件操作'],
    fragments: [
      {
        code: '#include <stdio.h>\n\n#define MAX_STUDENTS 50\n\ntypedef struct {\n    char name[50];\n    int id;\n    float score;\n} Student;\n\nStudent students[MAX_STUDENTS];\nint studentCount = 0;',
        explanation: '定义学生结构体和全局数组',
      },
      {
        code: 'void addStudent() {\n    if (studentCount >= MAX_STUDENTS) {\n        printf("Full!\\n");\n        return;\n    }\n    printf("Name: "); scanf("%s", students[studentCount].name);\n    printf("ID: "); scanf("%d", &students[studentCount].id);\n    printf("Score: "); scanf("%f", &students[studentCount].score);\n    studentCount++;\n}',
        explanation: '添加学生信息',
      },
      {
        code: 'void showStats() {\n    float sum = 0, max = 0, min = 100;\n    for (int i = 0; i < studentCount; i++) {\n        sum += students[i].score;\n        if (students[i].score > max) max = students[i].score;\n        if (students[i].score < min) min = students[i].score;\n    }\n    printf("Avg: %.1f, Max: %.1f, Min: %.1f\\n",\n           sum / studentCount, max, min);\n}',
        explanation: '统计平均分、最高分、最低分',
      },
    ],
  },
];
