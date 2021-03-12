interface IHeaderButtonProps {
    children?: string;
    className?: string;
    onClick: () => void;
}

export default function HeaderButton(props: IHeaderButtonProps) {

    return <button
        // eslint-disable-next-line
        className={'bg-green-200 focus:outline-none hover:bg-green-400 shadow-md rounded-sm px-1 py-0.5 w-20' + ' ' + props.className}
        onClick={props.onClick}>
        {props.children}
    </button>
}

interface IHeaderSubmitProps {
    children?: string;
    className?: string;
    value?: string;
    ref?: React.RefObject<HTMLInputElement>;
}
export function HeaderSubmit(props: IHeaderSubmitProps) {

    return <input
        type='submit'
        ref={props.ref}
        // eslint-disable-next-line
        className={'bg-green-200 focus:outline-none hover:bg-green-400 cursor-pointer shadow-md rounded-sm px-1 py-0.5 w-20' + ' ' + props.className}
        value={props.children || props.value} />
}