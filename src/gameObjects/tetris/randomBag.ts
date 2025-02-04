

export class RandomBag
{
    private bag: number[] = [];

    private readonly max: number;

    constructor(max: number)
    {
        this.max = max;
        this.resetBag();
    }

    public next() : number
    {
        let next = Math.round(Math.random() * (this.bag.length - 1)) + 0;
        let ret = this.bag[next];

        this.bag.splice(next, 1);

        if(this.bag.length == 0)
        {
            this.resetBag();
        }

        return ret;
    }

    public resetBag()
    {
        this.bag = new Array(this.max);

        for(let i = 0; i < this.max; ++i)
        {
            this.bag[i] = i;
        }
    }
}