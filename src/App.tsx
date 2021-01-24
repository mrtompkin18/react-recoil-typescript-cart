import React from 'react';
import './App.css';
import {atom, RecoilRoot, selector, useRecoilState, useRecoilValue} from "recoil";

interface Inventory {
    name: string,
    price: number
}

const inventory: Array<Inventory> = [
    {name: '🍌 Banana', price: 10},
    {name: '🍎 Apple', price: 5},
    {name: '🍿 Popcorn', price: 20},
];

const cartState = atom<Map<string, number>>({
    key: 'cartState',
    default: new Map<string, number>()
});

const totalState = selector<number>({
    key: 'totalState',
    get: ({get}) => {
        const cart = get<Map<string, number>>(cartState);
        return Array.from(cart).reduce((sum, [key, quality]) => {
            const {price}: Inventory = inventory.filter(item => item.name === key)[0];
            sum += price * quality;
            return sum;
        }, 0);
    }
})

function App(): JSX.Element {
    return (
        <RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>
                <div style={{display: "flex", justifyContent: "space-evenly"}}>
                    <AvailableItems/>
                    <Cart/>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Total/>
                </div>
            </React.Suspense>
        </RecoilRoot>
    );
}

function AvailableItems(): JSX.Element {
    const [cart, setCart] = useRecoilState(cartState);

    return (
        <div>
            <h3>Available Items</h3>
            <hr/>
            <ul>
                {inventory.map((item, index) => {
                    return (
                        <li key={index}>
                            {item.name} - ${item.price.toFixed(2)}
                            <button
                                onClick={() => {
                                    const map = new Map<string, number>(cart);
                                    const quality = (cart.get(item.name) || 0) + 1;
                                    map.set(item.name, quality);
                                    setCart(map);
                                }}>
                                add
                            </button>
                            {cart.get(item.name) &&
                            <button onClick={() => {
                                const map = new Map<string, number>(cart);
                                const quality = (cart.get(item.name) || 0) - 1;
                                if (quality === 0) {
                                    map.delete(item.name);
                                } else {
                                    map.set(item.name, quality);
                                }
                                setCart(map);
                            }}>
                                remove
                            </button>}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function Cart(): JSX.Element {
    return (
        <div>
            <h3>Cart</h3>
            <hr/>
            <CartItems/>
        </div>
    )
}

function CartItems(): JSX.Element {
    const cart = useRecoilValue<Map<string, number>>(cartState);
    const total = useRecoilValue(totalState);

    console.log(total);

    if (cart.size > 0) {
        return (
            <ul>
                {Array.from(cart).map(([key, value]) => <li key={key}>{key} x {value}</li>)}
            </ul>
        );
    }

    return <p>No items.</p>
}

function Total(): JSX.Element {
    const total = useRecoilValue(totalState);
    return (
        <div>
            <h3>Total</h3>
            <hr/>
            <p>Price: ${total}</p>
        </div>
    );
}

export default App;
