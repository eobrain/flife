# Floating-point variant of Conway's Game of Life

The standard Conway Game of Life has the following rule for cell value in the next generation where each cell can contain a Boolean

```js
s == 3 || p && s == 2
```

 `s` is the number of the eight neighboring cells that are `true` and `p` is the previous cell value

This variant has a floating-point value in every cell and the rule for the next value is

```js
g3(s) + p * g2(s) * K
```

where `g3` is a Guassian centered on 3 and `g2` is a Guassian centered on 2, and K is the constant `e / (1 + e)`