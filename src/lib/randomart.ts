/*
	Slightly modified version of [randomart](https://github.com/purpliminal/randomart)
	to run in web browsers based on SSH RSA keys
*/

export const symbols = {
  "-2": "E",
  "-1": "S",
  "0": " ",
  "1": ".",
  "2": "o",
  "3": "+",
  "4": "=",
  "5": "*",
  "6": "B",
  "7": "O",
  "8": "X",
  "9": "@",
  "10": "%",
  "11": "&",
  "12": "#",
  "13": "/",
  "14": "^"
} as const;

export const bounds = {
  width: 17,
  height: 9
};

export function createBoard(bounds: {width: number, height: number}): number[][] {
  var result: number[][] = [];

  for (var i = 0; i < bounds.width; i++) {
    result[i] = [];
    for (var j = 0; j < bounds.height; j++) {
      result[i][j] = 0;
    }
  }
  return result;
}

export function generateBoard(data: number[]) {
  var board = createBoard(bounds);

  var x = Math.floor(bounds.width / 2);
  var y = Math.floor(bounds.height / 2);

  board[x][y] = -1;

  data.forEach(
      function (b) {
        for (var s = 0; s < 8; s += 2) {
          var d = (b >> s) & 3;

          switch (d) {
            case 0: // up
            case 1:
              if (y > 0) y--;
              break;
            case 2: // down
            case 3:
              if (y < (bounds.height - 1)) y++;
              break;
          }
          switch (d) {
            case 0: // left
            case 2:
              if (x > 0) x--;
              break;
            case 1: // right
            case 3:
              if (x < (bounds.width - 1)) x++;
              break;
          }

          if (board[x][y] >= 0) board[x][y]++;
        }
      }
  );

  board[x][y] = -2;
  return board;
}

export function boardToString(board: number[][]) {
  var result: string[][] = [];

  for (var i = 0; i < bounds.height; i++) {
    result[i] = [];
    for (var j = 0; j < bounds.width; j++) {
      // @ts-ignore
      result[i][j] = symbols[board[j][i]] || symbols[0];
    }
    // Add | to start and end of result[i]
    result[i] = '|' + result[i].join('') + '|' as any;
  }
  result.splice(0, 0, '\n+---[ RSA2048 ]---+' as any);
  result.push('+-----------------+' as any);
  return result.join('\n');
}

export function randomart(data: number[]) {
  var buffer: string[] = [];
  for (var i = 0, length = data.length; i < length; i++) {
    buffer.push('0x' + data[i]);
  }
  // Write the board to HTML
  document.getElementById('hostKeyImg')!.innerHTML = boardToString(generateBoard(buffer as any));
  return;
}
