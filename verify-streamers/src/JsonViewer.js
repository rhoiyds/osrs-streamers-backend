function JsonViewer(props) {

    return (
        <pre>
            {JSON.stringify(props.verifiedStreamers, null, 2) }
        </pre>
    );

}

export default JsonViewer;
