'use client';

import Vapi from "@vapi-ai/web";

const Temp = () => {
	const vapi = new Vapi('bc70d4a2-9563-4172-bdb2-712b4084ba27');
	vapi.start('181a8564-58b5-4168-ad01-b53fa5f8f06e')

	return (
		<div>
			<h1>Temp</h1>
		</div>
	)
}

export default Temp;
