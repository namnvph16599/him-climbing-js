function convertInputFromFileInput(content) {
    const lines = content.split('\n');
    const input = {};

    lines.forEach((line) => {
        line = line.trim();
        const [parent, child] = line.split(': ');
        const [name, amount] = child.split('-');
        const parsedAmount = parseInt(amount)

        const isExitedParentNode = input.hasOwnProperty(parent)
        if (!isExitedParentNode) {
            input[parent] = {
                [name]: parsedAmount
            }
            return;
        }

        const oldValues = input[parent];
        input[parent] = {
            ...oldValues,
            [name]: parsedAmount
        }
    });
    return input
}

function convertToText(values = []) {
    return values.map(value => value.node + '-' + value.amount).join(', ')
}
function renderDivider() {
    return Array(25).map(i => '-').join('')
}

function automaticallyDownloadFileOutput(output, filename = 'output.txt') {
    let tableContent = 'Node\tAdjacent State\tList L1\tList\n';
    tableContent += `    \t${renderDivider()}\t${renderDivider()}\t${renderDivider()}\n`

    // Add data rows to the table
    for (const [key, value] of Object.entries(output)) {
        const node = key;
        const { neighbors = [], temporaryList = [], list = [] } = value
        tableContent += `${node}\t${convertToText(neighbors)}\t${convertToText(temporaryList)}\t${convertToText(list)}\n`;
    }

    tableContent += '\n'
    tableContent += `Conclusion: ${Object.keys(output).join(' => ')}`

    const blob = new Blob([tableContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}
function convertNodeObject(object) {
    return Object.entries(object)
        .map(([key, value]) => {
            return { node: key, amount: value };
        })
}

function hillClimbing(input, start, goal) {
    // type distances = {
    // neighbors: {node:string,amount:number}[] các thằng kề
    // temporaryList: {node:string,amount:number}[] các thằng kề sắp xếp theo amount từ bé đến lớn
    // list: {node:string,amount:number}[] danh sách lặp
    // }
    const distances = {};

    let current = start;
    while (current !== goal) {
        // Trạng thái kề
        const neighbors = convertNodeObject(input[current]) ?? []

        // Trạng thái kề sắp xếp theo giá trị nhỏ đến lớn
        const temporaryList = neighbors.sort((a, b) => a.amount - b.amount);

        // Lấy danh sách lặp cũ chưa lặp
        const mappedPaths = Object.keys(distances)
        const preNode = mappedPaths?.length > 0 ? mappedPaths[mappedPaths.length - 1] : null
        const oldList = (distances[preNode]?.list ?? [])

        const oldListWithoutCurrentNode = oldList.filter(it => it.node !== current)

        // Combine danh sách lặp mới và cũ chưa lặp
        const list = [...temporaryList, ...oldListWithoutCurrentNode]
        const next = temporaryList[0].node

        distances[current] = {
            neighbors,
            temporaryList,
            list
        }
        current = next;

        if (next == goal) {
            distances[next] = {}
        }
    }
    return distances
}

document.getElementById('btn_export').addEventListener('click', function (event) {
    const file = document.getElementById('file_input_').files[0];
    const start = document.getElementById('start').value.toUpperCase()
    const end = document.getElementById('end').value.toUpperCase()

    if (!file) {
        return alert('Please upload file.')
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const input = convertInputFromFileInput(content);
        const result = hillClimbing(input, start, end);
        automaticallyDownloadFileOutput(result);
    };

    reader.readAsText(file);
});
